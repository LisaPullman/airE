FROM node:20-alpine AS builder

WORKDIR /app

# Build args for Vite env
ARG VITE_API_BASE_URL
ARG VITE_BASE_PATH
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_BASE_PATH=${VITE_BASE_PATH}

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
# exclude backend folder from build context via .dockerignore
RUN npx tsc --noEmit --skipLibCheck || true && npx vite build

# ---- Production (Nginx) ----
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
