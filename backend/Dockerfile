FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code (no .env — injected via platform env vars)
COPY . .

# Cloud Run uses PORT env var, default to 8081
ENV PORT=8081

EXPOSE ${PORT}

# Run with uvicorn — Cloud Run sets PORT automatically
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
