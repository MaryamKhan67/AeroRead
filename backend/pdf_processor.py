import fitz # PyMuPDF
import re
import pytesseract
from PIL import Image
import io

# Optional: Configure tesseract path if it's not in the PATH
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def clean_text(text):
    """
    Clean the text by fixing broken line wraps that often happen in PDFs.
    """
    # Remove hyphenated line break words
    cleaned = re.sub(r'-\n', '', text)
    # Replace single newline characters that aren't paragraph boundaries with spaces
    cleaned = re.sub(r'(?<!\n)\n(?!\n)', ' ', cleaned)
    # Return cleaned and stripped text
    return cleaned.strip()

def process_pdf_file(filepath):
    """
    Extract text from a PDF, performing 'Anti-Gravity' layout reconstruction.
    """
    doc = fitz.open(filepath)
    blocks = []
    
    metadata = {
        'title': doc.metadata.get('title', 'Unknown Title') or 'Unknown Title',
        'author': doc.metadata.get('author', 'Unknown Author') or 'Unknown Author',
        'page_count': doc.page_count
    }
    
    block_id_counter = 0

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        page_dict = page.get_text("dict")
        
        page_has_text = False
        for block in page_dict.get("blocks", []):
            if block.get("type") == 0:
                page_has_text = True
                break
        
        # If no text is found, try OCR
        if not page_has_text:
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # Higher resolution for OCR
            img_data = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_data))
            
            # Simple OCR to get text
            ocr_text = pytesseract.image_to_string(img)
            if ocr_text.strip():
                blocks.append({
                    "id": f"block_{block_id_counter}",
                    "type": "paragraph",
                    "text": clean_text(ocr_text),
                    "page": page_num + 1,
                    "fontSize": 12 # Default for OCR
                })
                block_id_counter += 1
                continue

        # Normal text extraction
        for block in page_dict.get("blocks", []):
            if block.get("type") == 0:  # This is a text block rather than an image block
                block_text = ""
                max_font_size = 0
                is_bold = False
                
                for line in block.get("lines", []):
                    for span in line.get("spans", []):
                        span_text = span.get("text", "")
                        block_text += span_text
                        
                        # Monitor characteristics to infer headings
                        size = span.get("size", 10)
                        if size > max_font_size:
                            max_font_size = size
                        
                        flags = span.get("flags", 0)
                        # flags bit 4 (16) represents bold in PyMuPDF's integer flags
                        if flags & 2**4:
                            is_bold = True
                
                # Cleanup the anti-gravity block text
                block_text = clean_text(block_text)
                
                if not block_text:
                    continue
                    
                # Simple logic for determining what is a heading.
                # In most books, text is ~10-12pt. Larger means heading.
                block_type = "paragraph"
                if max_font_size > 13.5 or (is_bold and len(block_text) < 100):
                    block_type = "heading"
                    
                blocks.append({
                    "id": f"block_{block_id_counter}",
                    "type": block_type,
                    "text": block_text,
                    "page": page_num + 1,
                    "fontSize": round(max_font_size, 1)
                })
                block_id_counter += 1

    doc.close()
    return {
        "metadata": metadata,
        "blocks": blocks
    }

