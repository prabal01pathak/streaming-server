FROM node:16.16.0-alpine as builder
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package*.json ./
RUN npm install react-scripts@5.0.1 -g --silent
RUN npm ci --silent
COPY . ./
RUN npm run build
# RUN find . -type d -not -name 'dist' -not -path './.git*' -exec rm -rf {} +
CMD ["node", "dist/index.js"]