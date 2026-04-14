import fitz # PyMuPDF
import re
import pytesseract
from PIL import Image
import io
import os
import uuid
import unicodedata

# Optional: Configure tesseract path if it's not in the PATH
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def clean_text(text):
    """
    Precision cleaning of text while preserving Unicode integrity and layout.
    """
    if not text:
        return ""
    
    # Normalize Unicode characters (fixes some 'corrupted' symbol issues)
    text = unicodedata.normalize('NFKC', text)
    
    # Remove hyphenated line break words (e.g., "de- \nveloped" -> "developed")
    cleaned = re.sub(r'(\w+)-\s*\n\s*(\w+)', r'\1\2', text)
    
    return cleaned.strip()

def process_pdf_file(filepath, output_dir="uploads/images"):
    """
    Extract text and images from a PDF with strict layout integrity.
    Hierarchy: Page > Block > Line > Span
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)

    doc = fitz.open(filepath)
    blocks_result = []
    
    metadata = {
        'title': doc.metadata.get('title', 'Unknown Title') or 'Unknown Title',
        'author': doc.metadata.get('author', 'Unknown Author') or 'Unknown Author',
        'page_count': doc.page_count
    }
    
    block_id_counter = 0

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        page_width = page.rect.width
        page_height = page.rect.height
        
        # 1. Extract Images
        image_list = page.get_images(full=True)
        for img_index, img in enumerate(image_list):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            img_filename = f"pg{page_num+1}_img{img_index}_{uuid.uuid4().hex[:8]}.{image_ext}"
            img_path = os.path.join(output_dir, img_filename)
            
            with open(img_path, "wb") as f:
                f.write(image_bytes)
            
            # Find image location in page to get bbox
            img_bbox = [0, 0, 0, 0]
            try:
                for img_info in page.get_image_info():
                    if img_info.get('xref') == xref:
                        img_bbox = list(img_info['bbox'])
                        break
            except Exception as e:
                print(f"Warning: Could not get image info for xref {xref}: {e}")

            blocks_result.append({
                "id": f"img_{page_num}_{img_index}",
                "type": "image",
                "src": f"/api/files/images/{img_filename}",
                "page": page_num + 1,
                "bbox": img_bbox,
                "pageWidth": page_width,
                "pageHeight": page_height
            })

        # 2. Extract Text with High Fidelity
        page_dict = page.get_text("dict")
        
        # Check if page is empty/scanned
        page_has_text = any(b.get("type") == 0 for b in page_dict.get("blocks", []))
        
        if not page_has_text:
            try:
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                img_data = pix.tobytes("png")
                img = Image.open(io.BytesIO(img_data))
                ocr_text = pytesseract.image_to_string(img)
                if ocr_text.strip():
                    blocks_result.append({
                        "id": f"block_{block_id_counter}",
                        "type": "paragraph",
                        "text": clean_text(ocr_text),
                        "page": page_num + 1,
                        "is_ocr": True,
                        "bbox": [50, 50, page_width - 50, page_height - 50],
                        "pageWidth": page_width,
                        "pageHeight": page_height
                    })
                    block_id_counter += 1
            except Exception as e:
                print(f"Warning: OCR failed on page {page_num+1}: {e}")
            continue

        for block in page_dict.get("blocks", []):
            if block.get("type") == 0:  # Text block
                block_lines = []
                max_font_size = 0
                is_bold = False
                
                for line in block.get("lines", []):
                    line_text = ""
                    for span in line.get("spans", []):
                        span_text = span.get("text", "")
                        line_text += span_text
                        
                        size = span.get("size", 10)
                        if size > max_font_size:
                            max_font_size = size
                        
                        flags = span.get("flags", 0)
                        if flags & 2**4: # Bold
                            is_bold = True
                    
                    if line_text.strip():
                        block_lines.append(clean_text(line_text))

                if not block_lines:
                    continue
                
                # Combine lines while preserving breaks
                full_block_text = "\n".join(block_lines)
                
                # Determine type
                block_type = "paragraph"
                if max_font_size > 14 or (is_bold and len(full_block_text) < 120):
                    block_type = "heading"
                
                blocks_result.append({
                    "id": f"block_{block_id_counter}",
                    "type": block_type,
                    "text": full_block_text,
                    "page": page_num + 1,
                    "fontSize": round(max_font_size, 1),
                    "is_bold": is_bold,
                    "bbox": list(block.get("bbox", [0, 0, 0, 0])),
                    "pageWidth": page_width,
                    "pageHeight": page_height
                })
                block_id_counter += 1

    doc.close()
    return {
        "metadata": metadata,
        "blocks": blocks_result
    }
