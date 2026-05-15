FROM node:22-alpine

WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm install

# Copy source (will be overridden by volume mount in dev)
COPY . .

EXPOSE 5173

# Vite dev server — bind to 0.0.0.0 so Docker port-forward works
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
