# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# Build the Vite app
RUN npm run build

# Serve stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config to handle client-side routing and fallback
# (Optional, but good practice for SPAs, though this is currently mostly static pages)
RUN echo 'server { \
    listen 8080; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ =404; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose the standard Cloud Run port
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
