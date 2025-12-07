FROM node:20-alpine

ARG PORT=3000
ARG HOST=0.0.0.0

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE ${PORT}

# PORT and HOST will be set by docker-compose environment variables at runtime
# These are build-time defaults
ENV PORT=${PORT}
ENV HOST=${HOST}

CMD ["sh", "-c", "npm run dev -- -H ${HOST} -p ${PORT}"]

