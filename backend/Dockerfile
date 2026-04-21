# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port (adjust as needed)
EXPOSE 3000

# Start the backend
CMD ["npm", "start"]