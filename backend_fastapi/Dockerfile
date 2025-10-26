


FROM python:3.11-alpine

WORKDIR /app

RUN apk add --no-cache \
    gcc \
    musl-dev \
    libmagic \
    curl \
    bash \
    musl-locales \
    linux-headers \
    python3-dev




ENV LANG=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8

RUN pip install --upgrade pip

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app_self/ .

EXPOSE 9002


CMD ["python", "deploy.py"]
