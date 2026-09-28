#!/usr/bin/env python3
"""
Ring Cerberus - Hackathon Submission Packager
Creates a clean, self-contained project archive zip file under 35 MB.
"""

import os
import zipfile
from pathlib import Path

def create_submission_archive():
    root = Path(__file__).parent.parent.resolve()
    zip_path = root / "Ring-Cerberus-Submission.zip"

    # Exclude build artifacts, virtualenvs, local caches, and heavy binary media
    EXCLUDE_DIRS = {
        "node_modules",
        ".next",
        "__pycache__",
        ".git",
        ".vercel",
        "venv",
        ".venv",
        "temp_video",
        ".system_generated",
        "scratch"
    }

    EXCLUDE_EXTS = {
        ".mp4",
        ".webm",
        ".pyc"
    }

    print(f"[*] Packaging project from: {root}")
    total_files = 0

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
        for file_path in root.rglob("*"):
            if file_path.is_dir():
                continue
            
            rel_path = file_path.relative_to(root)
            
            # Check excluded directory names
            if any(part in EXCLUDE_DIRS for part in rel_path.parts):
                continue
                
            # Check excluded file extensions
            if file_path.suffix.lower() in EXCLUDE_EXTS:
                continue
                
            # Exclude self archive
            if file_path.name == "Ring-Cerberus-Submission.zip":
                continue

            zipf.write(file_path, arcname=str(rel_path).replace("\\", "/"))
            total_files += 1

    size_bytes = zip_path.stat().st_size
    size_mb = size_bytes / (1024 * 1024)

    print(f"[+] Total files archived: {total_files}")
    print(f"[+] Archive created at: {zip_path}")
    print(f"[+] Archive size: {size_mb:.2f} MB ({size_bytes:,} bytes)")
    
    return zip_path, size_mb

if __name__ == "__main__":
    create_submission_archive()
