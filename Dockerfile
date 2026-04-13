# Stage 1: Build Frontend
FROM node:18-alpine AS build-stage
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend & Final Image
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies for Tesseract OCR and PyMuPDF
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from stage 1
COPY --from=build-stage /app/frontend/dist ./frontend/dist

# Expose port
EXPOSE 10000

# Run with Gunicorn
CMD ["gunicorn", "--chdir", "backend", "--bind", "0.0.0.0:10000", "app:app"]
