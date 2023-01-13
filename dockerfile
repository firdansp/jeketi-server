FROM node:alpine

WORKDIR /app
COPY package*.json /app/
RUN apk add --no-cache nano make gcc g++ python && \
  npm install --production --silent && \
  apk del make gcc g++ python
COPY . .
CMD ["node", "."]

EXPOSE 3000