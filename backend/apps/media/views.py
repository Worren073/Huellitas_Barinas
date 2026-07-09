"""
Secure media file serving view.
Replaces django.views.static.serve in production.
"""

import mimetypes
from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404


def serve_media_file(request, path):
    """
    Serve a media file securely with security headers.

    - Validates path to prevent directory traversal
    - Sets X-Content-Type-Options: nosniff
    - Sets Cache-Control for performance
    """
    # Validate path traversal
    clean_path = Path(path).as_posix()
    if ".." in clean_path or clean_path.startswith("/"):
        raise Http404("Invalid path")

    full_path = settings.MEDIA_ROOT / clean_path
    full_path = full_path.resolve()

    # Ensure the resolved path is within MEDIA_ROOT
    media_root = settings.MEDIA_ROOT.resolve()
    if not str(full_path).startswith(str(media_root)):
        raise Http404("Invalid path")

    if not full_path.exists() or not full_path.is_file():
        raise Http404("File not found")

    content_type, _ = mimetypes.guess_type(str(full_path))
    if content_type is None:
        content_type = "application/octet-stream"

    response = FileResponse(
        open(full_path, "rb"),
        content_type=content_type,
    )
    response["Content-Disposition"] = "inline"
    response["X-Content-Type-Options"] = "nosniff"
    response["Cache-Control"] = "public, max-age=86400"
    return response
