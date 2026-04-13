import fitz

def create_test_pdf(filename):
    doc = fitz.open()
    page = doc.new_page()
    
    # Add some text
    page.insert_text((50, 50), "LuminaReader Test Document", fontsize=24, color=(0, 0, 0))
    page.insert_text((50, 100), "This is a test PDF to verify the Anti-Gravity Reading engine.", fontsize=12)
    
    # Add a heading-like text
    page.insert_text((50, 150), "Chapter 1: The Beginning", fontsize=18)
    
    # Add paragraph text
    para = """LuminaReader is designed to transform static PDF documents into a reflowable, customizable, and accessible reading experience. By extracting text blocks and reconstructing the layout, it provides a Kindle-like feel for any manuscript. This allows for theme customization, typography controls, and automatic reading progress tracking."""
    page.insert_textbox((50, 180, 500, 300), para, fontsize=11)
    
    doc.save(filename)
    doc.close()

if __name__ == "__main__":
    create_test_pdf("test_document.pdf")
    print("Created test_document.pdf")

