FROM node:20-alpine

WORKDIR /app

COPY package.json bun.lock* ./
RUN npm install

COPY . .

EXPOSE 8081

ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

CMD ["npx", "expo", "start", "--web", "--host", "0.0.0.0"]

