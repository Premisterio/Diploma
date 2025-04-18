import os
import uuid
import shutil
from fastapi import UploadFile, HTTPException
from typing import Optional

# Define upload directory relative to project root
UPLOAD_DIR = os.path.join("uploads", "data_files")

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_upload_file(upload_file: UploadFile, analyst_id: int) -> str:
    """
    Save an uploaded file to the file system
    Returns the file path relative to the project root
    """
    # Create a unique filename to avoid collisions
    file_extension = os.path.splitext(upload_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # Create directories if they don't exist
    analyst_upload_dir = os.path.join(UPLOAD_DIR, str(analyst_id))
    os.makedirs(analyst_upload_dir, exist_ok=True)
    
    # Create full file path
    file_path = os.path.join(analyst_upload_dir, unique_filename)
    
    try:
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")
    finally:
        upload_file.file.close()
    
    return file_path

def get_file_path(filename: str, analyst_id: int) -> Optional[str]:
    """
    Get the full file path for a file
    Returns None if file doesn't exist
    """
    file_path = os.path.join(UPLOAD_DIR, str(analyst_id), filename)
    if os.path.exists(file_path):
        return file_path
    return None