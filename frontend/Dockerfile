FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=development

COPY frontend/package.json frontend/package-lock.json ./

RUN npm install --prefer-offline --no-audit

COPY frontend/ .

EXPOSE 3000

CMD ["npm", "run", "dev"]
