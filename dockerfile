FROM node:22-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 \
    python-is-python3 \
    ffmpeg \
    curl \
    git \
    ca-certificates \
    opus-tools \
    libopus-dev \
    libsodium-dev \
    && rm -rf /var/lib/apt/lists/*

RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "run", "dev"]