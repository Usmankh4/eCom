from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from PIL import Image, ImageOps
import io
import os

def optimize_product_image(image_file, max_width=1200, quality=90):
    """
    Optimizes a product image by:
    1. Resizing to a maximum width while maintaining aspect ratio
    2. Applying auto-enhancement for better clarity
    3. Optimizing file size with quality settings
    4. Converting to progressive JPEG for web display
    
    Args:
        image_file: The uploaded image file
        max_width: Maximum width for the image
        quality: JPEG quality (1-100)
        
    Returns:
        Optimized image file path
    """
    if not image_file:
        return None
        
    try:
        # Open the image using PIL
        img = Image.open(image_file)
        
        # Convert to RGB if needed (for PNG with transparency)
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            alpha = img.convert('RGBA').split()[-1]
            bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
            bg.paste(img, mask=alpha)
            img = bg.convert("RGB")
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Calculate new dimensions
        width, height = img.size
        if width > max_width:
            ratio = max_width / width
            new_height = int(height * ratio)
            img = img.resize((max_width, new_height), Image.LANCZOS)
        
        # Apply auto-enhancement for better clarity
        img = ImageOps.autocontrast(img)
        
        # Save as progressive JPEG
        output = io.BytesIO()
        img.save(output, format='JPEG', quality=quality, optimize=True, progressive=True)
        output.seek(0)
        
        # Generate a new filename with optimization indicator
        filename = os.path.basename(image_file.name)
        name, ext = os.path.splitext(filename)
        new_filename = f"{name}_optimized.jpg"
        
        # Save the optimized image
        path = default_storage.save(f"products/{new_filename}", ContentFile(output.read()))
        return path
        
    except Exception as e:
        print(f"Image optimization error: {e}")
        return None
