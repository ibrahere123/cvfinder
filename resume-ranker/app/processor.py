import os
import multiprocessing
import pickle
import time # Added for potential timing/debugging
from typing import Optional, Tuple

import numpy as np
from tqdm import tqdm

# Assuming these imports are correct relative to your project structure
from .parser import ResumeParser
from .embeddings import EmbeddingService
from .faiss_db import FaissIndex

# --- Worker Process Initialization ---
# Global variable to hold the parser instance within each worker process
worker_parser: Optional[ResumeParser] = None

def init_worker():
    """
    Initializer function called once when each worker process starts.
    Creates a single ResumeParser instance for the lifetime of the worker.
    """
    global worker_parser
    # print(f"Initializing parser in process {os.getpid()}...") # Uncomment for debugging
    try:
        worker_parser = ResumeParser()
    except Exception as e:
        print(f"FATAL: Failed to initialize ResumeParser in process {os.getpid()}: {e}")
        # Optionally raise the exception or handle it such that the worker knows it failed
        worker_parser = None # Ensure it's None if init failed

def process_resume_worker(file_path: str) -> Tuple[Optional[dict], str]:
    """
    Processes a single resume file using the pre-initialized parser for this worker.
    """
    global worker_parser
    if worker_parser is None:
        print(f"Skipping {os.path.basename(file_path)} in process {os.getpid()} due to parser initialization failure.")
        return None, file_path # Return None if worker failed to initialize

    try:
        # Use the globally initialized parser for this worker process
        parsed_data = worker_parser.parse(file_path)
        # Return the parsed data and the original file path
        return parsed_data, file_path
    except Exception as e:
        # Log errors specific to parsing a single file
        print(f"Error parsing {os.path.basename(file_path)} in process {os.getpid()}: {str(e)}")
        # Consider adding traceback logging here for debugging if needed
        # import traceback
        # traceback.print_exc()
        return None, file_path # Indicate failure for this file


def batch_process(num_processes: Optional[int] = None, chunk_size: int = 20):
    """
    Processes resumes in batch using multiprocessing, generates embeddings,
    and builds a FAISS index.

    Args:
        num_processes: Number of CPU cores to use. Defaults to cpu_count().
        chunk_size: Number of tasks to send to each worker process at a time.
                    Adjust based on performance testing.
    """
    if num_processes is None:
        num_processes = multiprocessing.cpu_count()
        print(f"Defaulting to {num_processes} processes.")

    # --- Initialization (Main Process) ---
    print("Initializing services...")
    # Consider adding timing here if EmbeddingService/FaissIndex init is slow
    embedder = EmbeddingService() # Assumes efficient model loading
    faiss_index = FaissIndex()    # Assumes quick init

    resume_dir = "resume-ranker/resumes"
    faiss_index_dir = "data/faiss_index"
    resume_info_file = "data/resume_info.pkl"
    all_resume_info = {} # Stores metadata keyed by file path

    # --- Clear Existing Index ---
    print(f"Checking and clearing existing index in {faiss_index_dir}...")
    if not os.path.exists(faiss_index_dir):
        os.makedirs(faiss_index_dir)
    else:
        # Consider using a method on FaissIndex if it provides safer clearing
        cleared_files = 0
        for f in os.listdir(faiss_index_dir):
            # Be cautious with file extensions - adapt if your FaissIndex saves differently
            if f.endswith(('.index', '.pkl', '.npy', '.ivf')): # Added common extensions
                try:
                    os.remove(os.path.join(faiss_index_dir, f))
                    cleared_files += 1
                except OSError as e:
                     print(f"Warning: Could not remove file {f}: {e}")
        if cleared_files > 0:
             print(f"Cleared {cleared_files} existing index files.")
        # Alternatively, safer:
        # if hasattr(faiss_index, 'clear_storage'):
        #     faiss_index.clear_storage(faiss_index_dir)
        # else:
        #     # Manual removal as above or remove/recreate directory
        #     import shutil
        #     shutil.rmtree(faiss_index_dir)
        #     os.makedirs(faiss_index_dir)


    # --- Discover Files ---
    try:
        all_files = [
            os.path.join(resume_dir, f)
            for f in os.listdir(resume_dir)
            if os.path.isfile(os.path.join(resume_dir, f)) and f.lower().endswith(('.pdf', '.docx'))
        ]
        if not all_files:
             print(f"Warning: No resume files (.pdf, .docx) found in {resume_dir}")
             return # Exit if no files to process
        print(f"Found {len(all_files)} resume files to process.")
    except FileNotFoundError:
         print(f"Error: Resume directory not found at {resume_dir}")
         return
    except Exception as e:
        print(f"Error listing files in {resume_dir}: {e}")
        return


    # --- Parallel Parsing ---
    parsed_results = []
    print(f"Parsing resumes using {num_processes} processes (chunksize={chunk_size})...")
    # Use initializer to create one parser per worker
    with multiprocessing.Pool(processes=num_processes, initializer=init_worker) as pool:
        # Use imap_unordered for potentially faster result yielding
        # Pass the worker function and the list of files
        # Use chunksize to potentially reduce overhead
        results_iterator = pool.imap_unordered(process_resume_worker, all_files, chunksize=chunk_size)

        for result in tqdm(results_iterator, total=len(all_files), desc="Parsing Resumes"):
            parsed_results.append(result) # result is (parsed_data, file_path)

    # --- Process Results & Prepare for Embedding ---
    print("Processing parsed results...")
    valid_texts = []
    valid_file_paths = []
    processed_count = 0
    failed_count = 0

    for data, file_path in parsed_results:
        if data and data.get('raw_text'): # Check if parsing succeeded and text exists
            processed_count += 1
            valid_texts.append(data['raw_text'])
            valid_file_paths.append(file_path)

            # Extract metadata for lookup
            skills = data.get('skills', {})
            experience = data.get('experience', [])
            # Ensure duration is treated as float, default to 0.0
            total_experience = sum(float(exp.get('duration_years', 0.0) or 0.0) for exp in experience)
            num_positions = len(experience)

            # Store metadata keyed by the file path
            all_resume_info[file_path] = {
                'skills': skills,
                'total_experience': round(total_experience, 1),
                'num_positions': num_positions,
                'name': data.get('name'), # Store extracted name if available
                # Add other relevant parsed fields if needed later
            }
        else:
            failed_count += 1
            # Optionally log failed file paths here if needed
            # print(f"Parsing failed or yielded no text for: {file_path}")

    print(f"Successfully parsed: {processed_count}, Failed or no text: {failed_count}")

    if not valid_texts:
        print("No resumes were successfully parsed with text content. Exiting.")
        return

    # --- Generate Embeddings ---
    # NOTE: Embedding generation can be a bottleneck. Using a GPU-accelerated
    # EmbeddingService is highly recommended for speed.
    print(f"Generating embeddings for {len(valid_texts)} resumes...")
    start_time = time.time()
    # Assumes embedder.model.encode handles batching efficiently
    embeddings = embedder.model.encode(
        valid_texts,
        batch_size=128, # Example: Tune batch_size based on model/memory
        show_progress_bar=True # If the model supports it
    )
    end_time = time.time()
    print(f"Embedding generation took {end_time - start_time:.2f} seconds.")

    # Ensure embeddings are a numpy array
    if not isinstance(embeddings, np.ndarray):
        embeddings = np.array(embeddings)

    if embeddings.size == 0 or embeddings.shape[0] != len(valid_file_paths):
         print(f"Error: Embedding generation failed or returned unexpected shape: {embeddings.shape}. Expected {len(valid_file_paths)} embeddings.")
         return

    # --- Normalize Embeddings (Batch Operation) ---
    print("Normalizing embeddings...")
    start_time = time.time()
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    # Prevent division by zero for potential zero-vectors
    norms = np.where(norms == 0, 1e-10, norms)
    normalized_embeddings = embeddings / norms
    end_time = time.time()
    print(f"Normalization took {end_time - start_time:.2f} seconds.")


    # --- Add to FAISS Index (Batch Operation) ---
    print(f"Adding {normalized_embeddings.shape[0]} embeddings to FAISS index...")
    start_time = time.time()
    # *** IMPORTANT: Assumes your FaissIndex class has an efficient add_batch method ***
    # If not, you'll need to loop here, but keep the batch normalization above.
    if hasattr(faiss_index, 'add_batch'):
        try:
            faiss_index.add_batch(normalized_embeddings, valid_file_paths)
        except Exception as e:
             print(f"Error during faiss_index.add_batch: {e}")
             # Fallback or re-raise depending on desired behavior
             print("Attempting to add embeddings one by one as fallback...")
             # Fallback loop (if add_batch fails or doesn't exist)
             for i, norm_emb in enumerate(normalized_embeddings):
                  faiss_index.add(norm_emb, valid_file_paths[i]) # Assumes 'add' method exists

    else:
        # If add_batch method doesn't exist on your FaissIndex class
        print("FaissIndex.add_batch not found, adding embeddings one by one...")
        for i, norm_emb in enumerate(normalized_embeddings):
            faiss_index.add(norm_emb, valid_file_paths[i]) # Assumes 'add' method exists

    end_time = time.time()
    print(f"FAISS adding took {end_time - start_time:.2f} seconds.")


    # --- Save Index and Metadata ---
    print("Saving FAISS index...")
    faiss_index_path = os.path.join(faiss_index_dir, "faiss_index") # Base name
    try:
        faiss_index.save(faiss_index_path) # Pass the base path
    except Exception as e:
        print(f"Error saving FAISS index to {faiss_index_path}: {e}")


    print(f"Saving resume metadata to {resume_info_file}...")
    try:
        # Ensure directory exists
        os.makedirs(os.path.dirname(resume_info_file), exist_ok=True)
        with open(resume_info_file, 'wb') as f:
            pickle.dump(all_resume_info, f)
    except Exception as e:
        print(f"Error saving resume info to {resume_info_file}: {e}")


    # --- Final Report ---
    print("-" * 30)
    try:
         # Use the count from FaissIndex if available, otherwise use processed_count
         final_indexed_count = len(faiss_index.file_map) if hasattr(faiss_index, 'file_map') else processed_count
         print(f"Processing Complete.")
         print(f"Total files found: {len(all_files)}")
         print(f"Successfully parsed & processed: {processed_count}")
         print(f"Resumes indexed in FAISS: {final_indexed_count}")
         print(f"Parsing/Text Extraction failures: {failed_count}")
         print(f"FAISS index saved to: {faiss_index_dir}")
         print(f"Resume metadata saved to: {resume_info_file}")
    except Exception as e:
         print(f"Error generating final report: {e}") # Catch errors accessing faiss_index properties
    print("-" * 30)


if __name__ == "__main__":
    # Optional: Make num_processes and chunk_size command-line arguments
    # import argparse
    # parser = argparse.ArgumentParser(description="Batch process resumes.")
    # parser.add_argument("-n", "--num_processes", type=int, default=None, help="Number of processes (default: CPU count)")
    # parser.add_argument("-c", "--chunksize", type=int, default=20, help="Chunk size for multiprocessing")
    # args = parser.parse_args()
    # batch_process(num_processes=args.num_processes, chunk_size=args.chunksize)

    start_total_time = time.time()
    batch_process() # Run with defaults
    end_total_time = time.time()
    print(f"\nTotal script execution time: {end_total_time - start_total_time:.2f} seconds")
