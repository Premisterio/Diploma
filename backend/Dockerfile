FROM python:3.11-slim

WORKDIR /app

# Install dependencies first
COPY ./requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./app /app/app

# Create upload directory
RUN mkdir -p /app/uploads && chmod 755 /app/uploads

# Expose port for the application
EXPOSE $PORT

# Production command without --reload
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}