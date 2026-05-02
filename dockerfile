FROM node:22-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python-is-python3 \
    ffmpeg \
    curl \
    git \
    ca-certificates \
    libopus0 \
    libopus-dev \
    libsodium23 \
    libsodium-dev \
    && rm -rf /var/lib/apt/lists/*

RUN python3 -m pip install --break-system-packages -U "yt-dlp[default]"

COPY package*.json ./

RUN npm install

RUN npm install @discordjs/opus sodium-native

COPY . .

RUN npm run build

CMD ["npm", "run", "dev"]