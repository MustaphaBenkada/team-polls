FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install all dependencies including devDependencies
RUN npm install

COPY . .

# Set environment variables for Vite
ENV VITE_HOST=0.0.0.0
ENV VITE_PORT=5173

EXPOSE 5173

# Run in development mode with host binding
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"] 