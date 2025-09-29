FROM node:18-alpine AS builder

WORKDIR /app

# Copy only package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies with specific flags for faster installation
RUN npm install --omit=dev

# Copy only necessary files
COPY . .

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install only the necessary system packages
RUN apk add --no-cache bash netcat-openbsd

# Copy only the necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./
COPY --from=builder /app/index.js ./
COPY --from=builder /app/config ./config
COPY --from=builder /app/controllers ./controllers
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/middleware ./middleware
COPY --from=builder /app/models ./models
COPY --from=builder /app/utils ./utils
COPY --from=builder /app/uploads ./uploads

# Create wait-for-it script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
host="$1"\n\
shift\n\
cmd="$@"\n\
\n\
until nc -z "$host" 27017; do\n\
  >&2 echo "MongoDB is unavailable - sleeping"\n\
  sleep 1\n\
done\n\
\n\
>&2 echo "MongoDB is up - executing command"\n\
exec $cmd' > /app/wait-for-it.sh && chmod +x /app/wait-for-it.sh

EXPOSE 5000

CMD ["/app/wait-for-it.sh", "mongodb", "npm", "run", "dev"] 