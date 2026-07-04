FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=development

COPY package.json package-lock.json* ./

RUN npm install --prefer-offline --no-audit

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
