FROM python:3.8-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements-base.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements-base.txt

# Copy the rest of the application code
COPY . .

# Expose port
EXPOSE 5001

# Start the development server
CMD ["python", "app.py"] 