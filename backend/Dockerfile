FROM python:3.10-slim

# Install system dependencies including ffmpeg for audio transcoding
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency definition
COPY requirements.txt .

# Install PyTorch and Demucs dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download Demucs htdemucs model weights so first request is instant
RUN python -c "import demucs.pretrained; demucs.pretrained.get_model('htdemucs')"

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
