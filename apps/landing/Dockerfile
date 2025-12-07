FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE ${PORT:-3000}

ENV PORT=${PORT:-3000}
ENV HOST=${HOST:-0.0.0.0}

CMD ["sh", "-c", "npm run dev -- -H ${HOST} -p ${PORT}"]

