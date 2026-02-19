FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npm run prisma:generate

# Copy source and build
COPY . .
RUN npm run build

# Run database migrations (for production deployment)
RUN npm run prisma:migrate || true

# Prune dev dependencies for smaller image
RUN npm prune --production

EXPOSE 4000
CMD ["node", "dist/server.js"]
