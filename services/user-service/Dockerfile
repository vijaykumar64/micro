FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN mkdir -p dist/db/migrations && cp src/db/migrations/*.sql dist/db/migrations/
EXPOSE 3002
CMD ["node", "dist/index.js"]
