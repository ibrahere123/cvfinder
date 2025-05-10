from fastapi import FastAPI, File, UploadFile, HTTPException, Body, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import shutil
import os
import pickle
import logging
from tempfile import NamedTemporaryFile
from datetime import datetime  # Fixed import
from typing import Any

from .parser import ResumeParser
from .faiss_db import FaissIndex
from .embeddings import EmbeddingService

# Initialize FastAPI app
app = FastAPI(title="Resume Ranker API")

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:3001", "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for resumes
app.mount("/resumes", StaticFiles(directory="resume-ranker/resumes"), name="resumes")

# Initialize services
parser = ResumeParser()
embedding_service = EmbeddingService()
faiss_index = FaissIndex()
resume_metadata = {}

# Saved candidates storage
saved_candidates = set()

# Load FAISS index, metadata, and saved candidates on startup
@app.on_event("startup")
def load_index_and_metadata():
    global faiss_index, resume_metadata, saved_candidates
    try:
        faiss_index.load('data/faiss_index/faiss_index')
        logger.info("FAISS index loaded successfully.")
    except Exception as e:
        logger.error(f"Error loading FAISS index: {e}")

    try:
        with open('data/resume_info.pkl', 'rb') as f:
            resume_metadata = pickle.load(f)
        logger.info("Resume metadata loaded successfully.")
    except Exception as e:
        logger.error(f"Error loading resume metadata: {e}")

    try:
        with open('data/saved_candidates.pkl', 'rb') as f:
            saved_candidates = pickle.load(f)
        logger.info("Saved candidates loaded successfully.")
    except Exception as e:
        logger.warning("No saved candidates file found, starting fresh.")
        saved_candidates = set()

# Helper function to convert datetime objects to strings recursively
def convert_datetime(obj: Any) -> Any:
    if isinstance(obj, dict):
        return {k: convert_datetime(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_datetime(i) for i in obj]
    elif isinstance(obj, datetime):
        return obj.isoformat()
    else:
        return obj

# API endpoint to save a candidate
from fastapi import Request

class SaveCandidateRequest(BaseModel):
    file: str

@app.post("/save_candidate")
async def save_candidate(request: SaveCandidateRequest):
    global saved_candidates
    file = request.file
    if file not in resume_metadata:
        return JSONResponse(status_code=404, content={"detail": "Candidate not found"})
    saved_candidates.add(file)
    # Persist saved candidates
    with open('data/saved_candidates.pkl', 'wb') as f:
        pickle.dump(saved_candidates, f)
    return {"message": "Candidate saved successfully"}

# API endpoint to get saved candidates
@app.get("/saved_candidates")
async def get_saved_candidates():
    global saved_candidates, resume_metadata
    results = []
    for file in saved_candidates:
        meta = resume_metadata.get(file, {})
        results.append({
            "file": file,
            "name": meta.get("name"),
            "skills": meta.get("skills"),
            "total_experience": meta.get("total_experience"),
            "num_positions": meta.get("num_positions"),
            "metadata": meta
        })
    return {"results": results}

# API: Parse a single resume
@app.post("/parse_resumes_batch")
async def parse_resumes_batch(
    files: list[UploadFile] = File(...),
    batchName: str = Form(None),
    batch_id: str = Form(None)
):
    results = []
    valid_texts = []
    valid_file_paths = []
    all_resume_info = {}
    batch_time = datetime.now().isoformat()
    batch_id_value = batch_id or batch_time

    for file in files:
        logger.info(f"Received file: {file.filename}, content_type: {file.content_type}")
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in [".pdf", ".docx", ".doc", ".txt"]:
            results.append({
                "filename": file.filename,
                "error": "Unsupported file type"
            })
            continue

        try:
            with NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                shutil.copyfileobj(file.file, tmp)
                tmp_path = tmp.name

            parsed_data = parser.parse(tmp_path)
            os.remove(tmp_path)

            parsed_data = convert_datetime(parsed_data)

            # Collect valid texts and file paths for embedding
            if parsed_data and parsed_data.get('raw_text'):
                valid_texts.append(parsed_data['raw_text'])
                valid_file_paths.append(file.filename)

                # Extract metadata for lookup
                skills = parsed_data.get('skills', {})
                experience = parsed_data.get('experience', [])
                total_experience = sum(float(exp.get('duration_years', 0.0) or 0.0) for exp in experience)
                num_positions = len(experience)

                key = f"{batch_id_value}_{file.filename}"
                all_resume_info[key] = {
                    'skills': skills,
                    'total_experience': round(total_experience, 1),
                    'num_positions': num_positions,
                    'name': parsed_data.get('name'),
                    'batch_time': batch_time,  # Store batch upload time
                    'batch_name': batchName,  # Store batch name
                    'batch_id': batch_id_value,  # Store batch id
                }

            key = f"{batch_id_value}_{file.filename}"
            results.append({
                "filename": file.filename,
                "parsed_data": parsed_data,
                "metadata_key": key
            })
        except Exception as e:
            logger.error(f"Error parsing resume {file.filename}: {e}")
            results.append({
                "filename": file.filename,
                "error": str(e)
            })

    # Generate embeddings and update FAISS index for valid resumes
    if valid_texts:
        try:
            embeddings = embedding_service.model.encode(
                valid_texts,
                batch_size=128,
                show_progress_bar=False
            )
            import numpy as np
            if not isinstance(embeddings, np.ndarray):
                embeddings = np.array(embeddings)

            # Normalize embeddings
            norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
            norms = np.where(norms == 0, 1e-10, norms)
            normalized_embeddings = embeddings / norms

            # Add to FAISS index
            if hasattr(faiss_index, 'add_batch'):
                faiss_index.add_batch(normalized_embeddings, valid_file_paths)
            else:
                for i, norm_emb in enumerate(normalized_embeddings):
                    faiss_index.add(norm_emb, valid_file_paths[i])

            # Save index and metadata
            faiss_index.save('data/faiss_index/faiss_index')

            # Load existing metadata and update
            import pickle
            try:
                with open('data/resume_info.pkl', 'rb') as f:
                    existing_metadata = pickle.load(f)
            except Exception:
                existing_metadata = {}

            existing_metadata.update(all_resume_info)

            with open('data/resume_info.pkl', 'wb') as f:
                pickle.dump(existing_metadata, f)

            logger.info(f"Batch upload: Indexed {len(valid_file_paths)} resumes successfully.")
        except Exception as e:
            logger.error(f"Error during embedding/indexing in batch upload: {e}")

    return JSONResponse(content={"results": results})

# In-memory store for recent searches
recent_searches = []

# API: Search resumes
class SearchRequest(BaseModel):
    query: str
    k: int

@app.post("/search_resumes")
async def search_resumes(request: SearchRequest):
    query = request.query
    k = request.k
    if not query or query.strip() == "":
        raise HTTPException(status_code=400, detail="Query string is required")

    try:
        # Log the search query to recent_searches
        from datetime import datetime
        # Limit recent_searches to last 10 entries
        if len(recent_searches) >= 10:
            recent_searches.pop(0)
        recent_searches.append({
            "id": len(recent_searches) + 1,
            "query": query,
            "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "results": 0,  # Will update after search
            "matchScore": 0  # Placeholder, can be improved
        })

        query_embedding = embedding_service.model.encode([query])
        try:
            results = faiss_index.search(query_embedding, query, k)
        except Exception as search_error:
            logger.error(f"Error during faiss_index.search: {search_error}", exc_info=True)
            raise HTTPException(status_code=500, detail="Internal error during search")

        enriched_results = []
        for res in results:
            file_path = res.get("file")
            meta = resume_metadata.get(file_path, {})
            enriched_results.append({
                "file": file_path,
                "score": res.get("score"),
                "matching_rate_percent": round(res.get("score", 0) * 100, 2),
                "vector_score": res.get("vector_score"),
                "keyword_score": res.get("keyword_score"),
                "name": meta.get("name"),
                "skills": meta.get("skills"),
                "total_experience": meta.get("total_experience"),
                "num_positions": meta.get("num_positions"),
                "metadata": meta
            })

        # Update the last recent_searches entry with results count and average match score
        if enriched_results:
            recent_searches[-1]["results"] = len(enriched_results)
            avg_match_score = sum(r.get("matching_rate_percent", 0) for r in enriched_results) / len(enriched_results)
            recent_searches[-1]["matchScore"] = round(avg_match_score)

        return {"query": query, "results": enriched_results, "total_count": len(enriched_results)}
    except Exception as e:
        logger.error("Exception in search_resumes:", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error searching resumes: {str(e)}")

# API: Get recent searches
@app.get("/recent_searches")
async def get_recent_searches():
    return {"recent_searches": recent_searches}

import os
from datetime import datetime

@app.get("/recent_uploads")
async def get_recent_uploads():
    global resume_metadata
    # Always reload the latest metadata from disk
    try:
        with open('data/resume_info.pkl', 'rb') as f:
            resume_metadata = pickle.load(f)
    except Exception:
        resume_metadata = {}
    uploads = []
    batch_groups = {}
    for filename, meta in resume_metadata.items():
        batch_id = meta.get("batch_id")
        batch_time = meta.get("batch_time")
        batch_name = meta.get("batch_name")
        if not batch_id:
            continue
        if batch_id not in batch_groups:
            batch_groups[batch_id] = {
                "files": [],
                "total_files": 0,
                "success_count": 0,
                "failed_count": 0,
                "batch_name": batch_name,
                "batch_time": batch_time,
            }
        batch_groups[batch_id]["files"].append({
            "filename": filename,
            "name": meta.get("name", filename),
            "metadata": meta
        })
        batch_groups[batch_id]["total_files"] += 1
        if meta.get("error"):
            batch_groups[batch_id]["failed_count"] += 1
        else:
            batch_groups[batch_id]["success_count"] += 1
    for batch_id, batch_data in batch_groups.items():
        uploads.append({
            "id": batch_id,
            "name": batch_data["batch_name"] or f"Batch Upload ({batch_data['total_files']} files)",
            "date": batch_data["batch_time"],
            "fileCount": batch_data["total_files"],
            "status": "completed" if batch_data["failed_count"] == 0 else "partial",
            "successCount": batch_data["success_count"],
            "failedCount": batch_data["failed_count"],
            "files": batch_data["files"]
        })
    uploads_sorted = sorted(uploads, key=lambda x: x["date"], reverse=True)
    return {"uploads": uploads_sorted[:10]}

# API: Automatically parse and index resumes from a folder
@app.post("/auto_parse_resumes")
async def auto_parse_resumes(source_dir: str = Body(..., embed=True)):
    global resume_metadata, faiss_index

    if not os.path.exists(source_dir) or not os.path.isdir(source_dir):
        raise HTTPException(status_code=400, detail="Invalid source directory")

    new_metadata = {}
    new_files_count = 0

    try:
        for filename in os.listdir(source_dir):
            ext = os.path.splitext(filename)[1].lower()
            if ext not in [".pdf", ".docx", ".doc", ".txt"]:
                continue

            file_path = os.path.join(source_dir, filename)
            if file_path in resume_metadata:
                continue

            parsed_data = parser.parse(file_path)
            embedding = embedding_service.generate(parsed_data.get('raw_text', ''))

            faiss_index.add(embedding, file_path)

            new_metadata[file_path] = {
                "name": parsed_data.get("name"),
                "skills": parsed_data.get("skills"),
                "total_experience": parsed_data.get("total_experience_years"),
                "num_positions": len(parsed_data.get("experience", [])),
                "parsed_data": parsed_data
            }
            new_files_count += 1

        resume_metadata.update(new_metadata)

        faiss_index.save('data/faiss_index/faiss_index')
        with open('data/resume_info.pkl', 'wb') as f:
            pickle.dump(resume_metadata, f)

        logger.info(f"Successfully parsed and indexed {new_files_count} new resumes.")
        return {"message": f"Successfully parsed and indexed {new_files_count} new resumes."}
    except Exception as e:
        logger.error("Exception in auto_parse_resumes:", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error during automated parsing: {str(e)}")

@app.post("/upload_resume")
async def upload_resume(
    file: UploadFile = File(...),
    batch_time: str = Form(None),
    batch_name: str = Form(None),
    batch_id: str = Form(None)
):
    """
    Upload and process a single resume file.
    Returns the parsed data and adds it to the search index.
    """
    logger.info(f"Received file: {file.filename}, content_type: {file.content_type}")
    
    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".docx", ".doc", ".txt"]:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    try:
        # Save uploaded file temporarily
        with NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        # Parse resume
        parsed_data = parser.parse(tmp_path)
        os.remove(tmp_path)  # Clean up temp file

        if not parsed_data or not parsed_data.get('raw_text'):
            raise HTTPException(status_code=422, detail="Could not extract text from resume")

        # Generate embedding
        embedding = embedding_service.generate(parsed_data['raw_text'])
        
        # Add to FAISS index
        faiss_index.add(embedding, file.filename)
        
        # Save index
        faiss_index.save('data/faiss_index/faiss_index')

        # Update metadata
        experience = parsed_data.get('experience', [])
        total_experience = sum(float(exp.get('duration_years', 0.0) or 0.0) for exp in experience)
        batch_id_value = batch_id or (batch_time or datetime.now().isoformat())
        # --- FIX: Load existing metadata, update, then save ---
        try:
            with open('data/resume_info.pkl', 'rb') as f:
                existing_metadata = pickle.load(f)
        except Exception:
            existing_metadata = {}
        key = f"{batch_id_value}_{file.filename}"
        existing_metadata[key] = {
            'skills': parsed_data.get('skills', []),
            'total_experience': round(total_experience, 1),
            'num_positions': len(experience),
            'name': parsed_data.get('name'),
            'parsed_data': parsed_data,
            'batch_time': batch_time or datetime.now().isoformat(),
            'batch_name': batch_name,
            'batch_id': batch_id_value,
        }
        with open('data/resume_info.pkl', 'wb') as f:
            pickle.dump(existing_metadata, f)
        resume_metadata.update(existing_metadata)
        # --- END FIX ---
        return {
            "filename": file.filename,
            "parsed_data": convert_datetime(parsed_data),
            "message": "Resume uploaded and processed successfully"
        }

    except Exception as e:
        logger.error(f"Error processing resume {file.filename}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
