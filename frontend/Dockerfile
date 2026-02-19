# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files for production dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Set production environment
ENV NODE_ENV=production

EXPOSE 3000
CMD ["npm", "run", "start"]
