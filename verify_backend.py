import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from pdf_processor import process_pdf_file

def test_processing():
    pdf_path = "test_document.pdf"
    if not os.path.exists(pdf_path):
        print(f"Error: {pdf_path} not found.")
        return
    
    try:
        print(f"Processing {pdf_path}...")
        result = process_pdf_file(pdf_path)
        
        print("\nMetadata:")
        print(result['metadata'])
        
        print(f"\nExtracted {len(result['blocks'])} blocks.")
        for i, block in enumerate(result['blocks'][:5]):
            print(f"\nBlock {i+1} ({block['type']}):")
            print(block['text'][:100] + "..." if len(block['text']) > 100 else block['text'])
            
        print("\nProcessing check: SUCCESS")
    except Exception as e:
        print(f"\nProcessing check: FAILED - {str(e)}")

if __name__ == "__main__":
    test_processing()
