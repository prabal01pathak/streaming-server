FROM node:16.16.0-alpine as builder
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build
# RUN find . -type d -not -name 'dist' -not -path './.git*' -exec rm -rf {} +
EXPOSE 8080
CMD ["node", "dist/index.js"]