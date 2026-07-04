FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Compilation deps in single layer - faster cleanup
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc && \
    pip install --upgrade pip wheel setuptools && \
    apt-cache search libpq-dev | grep -q libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt && \
    apt-get remove -y libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY . .

RUN chmod +x entrypoint.sh entrypoint-worker.sh entrypoint-beat.sh

EXPOSE 8000
ENTRYPOINT ["./entrypoint.sh"]
