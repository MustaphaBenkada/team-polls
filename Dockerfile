FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

RUN npm install -g pg-migrate@2.0.1  # Explicitly install pg-migrate globally in the image

COPY . .

RUN npx tsc

CMD ["node", "dist/index.js"]