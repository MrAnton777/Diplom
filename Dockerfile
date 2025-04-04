FROM node:20.16

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY nest-cli.json ./
COPY eslint.config.mjs ./
COPY .prettierrc ./
COPY test/ ./test
COPY src/ ./src

CMD ["npm","run","start"]