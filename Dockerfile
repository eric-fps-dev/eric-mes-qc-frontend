# Stage 1: Build the application
FROM node:20-alpine AS builder

ARG BUILD_MODE=dev

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --registry=https://registry.npmmirror.com --legacy-peer-deps

COPY . .

RUN npm run build:${BUILD_MODE}

# Stage 2: Operation
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

# Copy custom NGINX config
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html/qc

# Expose the default NGINX port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
