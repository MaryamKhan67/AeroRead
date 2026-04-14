from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import werkzeug
from pdf_processor import process_pdf_file

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='/')
# Allow CORS for development
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Serve React App
@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    # If the file exists in the static folder, serve it
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    # Otherwise, return the index.html (SPA routing)
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/files/images/<path:filename>')
def serve_extracted_images(filename):
    images_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'images')
    return send_from_directory(images_dir, filename)

@app.route('/api/upload', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and file.filename.lower().endswith('.pdf'):
        filename = werkzeug.utils.secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Generate metadata and ToC for the sidebar/reflow
            data = process_pdf_file(filepath)
            
            # Build complete response including the URL to the raw file
            return jsonify({
                "success": True,
                "filename": filename,
                "fileUrl": f"/api/files/{filename}",
                "data": data
            }), 200
        except Exception as e:
            import traceback
            print("ERROR during PDF processing:")
            traceback.print_exc()
            return jsonify({'error': str(e)}), 500

    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/files/<path:filename>')
def serve_pdf_file(filename):
    """Serve the original PDF file to the frontend for canvas rendering."""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    # Listen on all interfaces for local testing, Render will use environment variables
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
