# Backend Dockerfile for GDGoC Certificate Generator
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy application source
COPY src ./src

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "src/index.js"]
