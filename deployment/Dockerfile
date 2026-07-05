FROM python:3.11-slim

WORKDIR /app

# System deps for Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps (CPU-only PyTorch keeps image small)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code and model weights
COPY app.py .
COPY plant_disease_model.pth .

# HF Spaces expects port 7860
EXPOSE 7860

# Run with uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
