# Frontend Dockerfile for GDGoC Certificate Generator
# Multi-stage build: Build stage + Nginx serve stage

# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Use `npm install` when a lockfile isn't present. Prefer committing a package-lock.json
# for reproducible builds; see README steps below to add one.
RUN npm install

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_ADMIN_HOSTNAME
ARG VITE_PUBLIC_HOSTNAME

# Set environment variables for build
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_ADMIN_HOSTNAME=${VITE_ADMIN_HOSTNAME}
ENV VITE_PUBLIC_HOSTNAME=${VITE_PUBLIC_HOSTNAME}

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
