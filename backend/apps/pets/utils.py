"""
Image utilities for pets app.
Handles WebP conversion for uploaded images.
"""

from io import BytesIO

from django.core.files.uploadedfile import InMemoryUploadedFile
from PIL import Image


def convert_to_webp(image_file, quality=85, max_width=1200):
    """
    Convert an image to WebP format.

    Args:
        image_file: The uploaded image file
        quality: WebP quality (1-100, default 85)
        max_width: Maximum width in pixels (default 1200)

    Returns:
        InMemoryUploadedFile with WebP image
    """
    img = Image.open(image_file)

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
