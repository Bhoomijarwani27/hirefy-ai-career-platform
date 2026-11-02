
# 1. Use the exact Node.js version
FROM node:24.13.0-bookworm-slim

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# 2. Set the project working directory
WORKDIR /app

# 3. Install the exact npm version
RUN npm install --global npm@11.6.2

# 4. Copy package configuration files
COPY package.json package-lock.json ./

# 5. Install exact project dependencies
# A temporary database URL allows Prisma config to load
# during dependency installation. It is not a real credential.
RUN DATABASE_URL="postgresql://user:password@localhost:5432/build_placeholder" npm ci

# 6. Copy the remaining project files
COPY . .

# 7. Expose the Next.js development port
EXPOSE 3000

# 8. Generate Prisma Client and start Next.js
CMD ["sh", "-c", "npx prisma generate && npm run dev -- --hostname 0.0.0.0"]
