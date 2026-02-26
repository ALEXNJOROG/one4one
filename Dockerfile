FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 80

RUN npm run build
CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3004"]