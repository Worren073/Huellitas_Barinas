"""
Image utilities for pets app.
Handles WebP conversion for uploaded images.
"""

from io import BytesIO

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import InMemoryUploadedFile
from PIL import Image, ImageOps

MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB

ALLOWED_MAGIC_BYTES = {
    b"\xff\xd8\xff": "JPEG",
    b"\x89PNG\r\n\x1a\n": "PNG",
    b"GIF87a": "GIF",
    b"GIF89a": "GIF",
    b"RIFF": "WEBP",  # WebP starts with RIFF, WEBP at offset 8
    b"BM": "BMP",
}


def _check_magic_bytes(file_data):
    """Validate image signature via magic bytes."""
    for magic, fmt in ALLOWED_MAGIC_BYTES.items():
        if magic == b"RIFF":
            if file_data[:4] == b"RIFF" and file_data[8:12] == b"WEBP":
                return
        elif file_data[: len(magic)] == magic:
            return
    raise ValidationError(
        "Formato de imagen no soportado. Usa JPEG, PNG, GIF, WebP o BMP."
    )


def validate_image(image_file):
    """Validate image file before processing."""
    if image_file.size > MAX_UPLOAD_SIZE:
        raise ValidationError(
            f"La imagen excede el tamaño máximo de {MAX_UPLOAD_SIZE // (1024 * 1024)} MB."
        )
    magic = image_file.read(12)
    image_file.seek(0)
    _check_magic_bytes(magic)


def convert_to_webp(image_file, quality=85, max_width=1200):
    """
    Convert an image to WebP format.

    Applies EXIF orientation to prevent auto-rotation issues
    from phone/camera photos.

    Args:
        image_file: The uploaded image file
        quality: WebP quality (1-100, default 85)
        max_width: Maximum width in pixels (default 1200)

    Returns:
        InMemoryUploadedFile with WebP image
    """
    validate_image(image_file)

    try:
        img = Image.open(image_file)
    except Exception as e:
        raise ValidationError(f"El archivo no es una imagen válida: {e}")

    # Apply EXIF orientation before any processing
    img = ImageOps.exif_transpose(img) or img

    # Convert RGBA to RGB (WebP doesn't support transparency in all browsers)
    if img.mode == "RGBA":
        img = img.convert("RGB")

    # Resize if too large
    if img.width > max_width:
        ratio = max_width / img.width
        new_height = int(img.height * ratio)
        img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)

    # Save as WebP
    buffer = BytesIO()
    img.save(buffer, format="WEBP", quality=quality)
    buffer.seek(0)

    # Create new filename
    old_name = image_file.name
    new_file_name = old_name.rsplit(".", 1)[0] + ".webp"

    return InMemoryUploadedFile(
        buffer, 'image', new_file_name, "image/webp", buffer.tell(), None
    )
