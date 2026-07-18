# Stage 1: Build phase
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Final runner phase
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Only pull production assets to keep security vulnerabilities minimal
RUN npm進 ci --only=production
COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
USER node
CMD ["npm", "start"]