import os
import uuid
import asyncio
import logging
from typing import Dict, Any
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from audio_processor import StemSeparator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api")

app = FastAPI(
    title="Song to Instrumental AI Engine",
    description="High-fidelity vocal removal and instrumental stem separation API",
    version="1.0.0"
)

# Enable CORS for Flutter mobile / web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories
BASE_DIR = Path(__file__).resolve().parent
STORAGE_DIR = BASE_DIR / "storage"
UPLOAD_DIR = STORAGE_DIR / "uploads"
OUTPUT_DIR = STORAGE_DIR / "outputs"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# In-memory job state store (can be replaced with Redis / DB in production)
jobs_db: Dict[str, Dict[str, Any]] = {}

separator = StemSeparator()

def process_separation_task(job_id: str, input_file_path: str):
    """
    Background worker that runs stem separation
    """
    try:
        jobs_db[job_id]["status"] = "processing"
        jobs_db[job_id]["progress"] = 30
        logger.info(f"Starting processing for job {job_id}")

        job_output_dir = OUTPUT_DIR / job_id
        results = separator.separate_to_instrumental(input_file_path, str(job_output_dir))

        jobs_db[job_id]["status"] = "completed"
        jobs_db[job_id]["progress"] = 100
        jobs_db[job_id]["instrumental_path"] = results["instrumental"]
        jobs_db[job_id]["vocals_path"] = results["vocals"]
        logger.info(f"Successfully separated stems for job {job_id}")

    except Exception as e:
        logger.exception(f"Error processing job {job_id}: {str(e)}")
        jobs_db[job_id]["status"] = "failed"
        jobs_db[job_id]["error"] = str(e)


@app.get("/")
def root():
    return {
        "service": "Song to Instrumental AI API",
        "status": "online",
        "supported_formats": ["mp3", "wav", "m4a", "flac", "ogg"]
    }


@app.post("/api/upload")
async def upload_song(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Endpoint for mobile app to upload audio files.
    Initiates asynchronous stem isolation.
    """
    allowed_extensions = {".mp3", ".wav", ".m4a", ".flac", ".ogg"}
    file_ext = Path(file.filename).suffix.lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{file_ext}'. Allowed: {list(allowed_extensions)}"
        )

    job_id = str(uuid.uuid4())
    save_path = UPLOAD_DIR / f"{job_id}_{file.filename}"

    # Save uploaded file
    with open(save_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    jobs_db[job_id] = {
        "job_id": job_id,
        "original_filename": file.filename,
        "file_size": len(content),
        "status": "queued",
        "progress": 5,
        "input_path": str(save_path),
        "instrumental_path": None,
        "vocals_path": None,
        "error": None
    }

    # Dispatch to background task
    background_tasks.add_task(process_separation_task, job_id, str(save_path))

    return {
        "message": "Audio uploaded successfully. Processing started.",
        "job_id": job_id,
        "filename": file.filename
    }


@app.get("/api/status/{job_id}")
async def check_status(job_id: str):
    """
    Polls the processing progress and status of a song job.
    """
    job = jobs_db.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    response = {
        "job_id": job["job_id"],
        "status": job["status"],
        "progress": job.get("progress", 0),
        "original_filename": job["original_filename"],
        "error": job.get("error")
    }

    if job["status"] == "completed":
        response["instrumental_url"] = f"/api/audio/{job_id}/instrumental"
        response["vocals_url"] = f"/api/audio/{job_id}/vocals"

    return response


@app.get("/api/audio/{job_id}/{track_type}")
async def get_audio_stream(job_id: str, track_type: str):
    """
    Serves the processed audio track (instrumental or vocals) for streaming/playback.
    track_type can be 'instrumental' or 'vocals'.
    """
    job = jobs_db.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Audio processing is not finished yet")

    if track_type == "instrumental":
        file_path = job.get("instrumental_path")
        export_name = f"Instrumental_{job['original_filename']}.mp3"
    elif track_type == "vocals":
        file_path = job.get("vocals_path")
        export_name = f"Vocals_{job['original_filename']}.mp3"
    else:
        raise HTTPException(status_code=400, detail="Invalid track type. Choose 'instrumental' or 'vocals'")

    if not file_path or not Path(file_path).exists():
        raise HTTPException(status_code=404, detail="Audio file not found on server")

    return FileResponse(
        path=file_path,
        media_type="audio/mpeg",
        filename=export_name
    )


if __name__ == "__main__":
    import uvicorn
    # Default local dev port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
