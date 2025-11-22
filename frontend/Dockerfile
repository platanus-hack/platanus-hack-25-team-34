FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

COPY . .

EXPOSE 5173

# Install dependencies on startup to catch any package.json changes
CMD ["sh", "-c", "npm install && npm run dev -- --host"]
