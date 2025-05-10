from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import os

# Google Drive API imports
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Dropbox API import
import dropbox

# For local DB (using sqlite3 for demonstration)
import sqlite3

router = APIRouter(
    prefix="/external_storage",
    tags=["external_storage"]
)

# Google Drive connection config
class GoogleDriveConfig(BaseModel):
    credentials_json: str  # JSON string of service account credentials

# Dropbox connection config
class DropboxConfig(BaseModel):
    access_token: str

# Local DB connection helper
def get_db_connection():
    conn = sqlite3.connect("resume_storage.db")
    conn.row_factory = sqlite3.Row
    return conn

# Endpoint to connect and list files from Google Drive
@router.post("/google_drive/list_files")
async def list_google_drive_files(config: GoogleDriveConfig):
    if not config.credentials_json:
        raise HTTPException(status_code=400, detail="Credentials JSON is required")
    try:
        credentials_info = eval(config.credentials_json)
        credentials = service_account.Credentials.from_service_account_info(credentials_info, scopes=['https://www.googleapis.com/auth/drive.readonly'])
        service = build('drive', 'v3', credentials=credentials)
        results = service.files().list(pageSize=10, fields="files(id, name)").execute()
        items = results.get('files', [])
        files = [{"id": item['id'], "name": item['name']} for item in items]
        return {"files": files}
    except HttpError as error:
        raise HTTPException(status_code=500, detail=f"Google Drive API error: {error}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# Endpoint to connect and list files from Dropbox
@router.post("/dropbox/list_files")
async def list_dropbox_files(config: DropboxConfig):
    if not config.access_token:
        raise HTTPException(status_code=400, detail="Access token is required")
    try:
        dbx = dropbox.Dropbox(config.access_token)
        result = dbx.files_list_folder(path='', limit=10)
        files = [{"id": entry.id, "name": entry.name} for entry in result.entries if isinstance(entry, dropbox.files.FileMetadata)]
        return {"files": files}
    except dropbox.exceptions.AuthError:
        raise HTTPException(status_code=401, detail="Invalid Dropbox access token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dropbox API error: {str(e)}")

# Endpoint to save resume metadata to local DB
class ResumeMetadata(BaseModel):
    filename: str
    name: Optional[str]
    skills: Optional[List[str]] = []
    total_experience: Optional[float] = 0.0

@router.post("/local_db/save_resume")
async def save_resume_metadata(metadata: ResumeMetadata):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS resumes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT UNIQUE,
            name TEXT,
            skills TEXT,
            total_experience REAL
        )
    """)
    skills_str = ",".join(metadata.skills) if metadata.skills else ""
    try:
        cursor.execute("""
            INSERT OR REPLACE INTO resumes (filename, name, skills, total_experience)
            VALUES (?, ?, ?, ?)
        """, (metadata.filename, metadata.name, skills_str, metadata.total_experience))
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    conn.close()
    return {"message": "Resume metadata saved successfully"}

# Endpoint to list saved resumes from local DB
@router.get("/local_db/list_resumes")
async def list_saved_resumes():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT filename, name, skills, total_experience FROM resumes
    """)
    rows = cursor.fetchall()
    conn.close()
    results = []
    for row in rows:
        skills_list = row["skills"].split(",") if row["skills"] else []
        results.append({
            "filename": row["filename"],
            "name": row["name"],
            "skills": skills_list,
            "total_experience": row["total_experience"]
        })
    return {"resumes": results}
