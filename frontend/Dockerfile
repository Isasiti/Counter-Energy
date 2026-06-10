# Build stage
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN npm install --frozen-lockfile || pnpm install

COPY . .

RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Copiamos los archivos necesarios
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./ 

# Nos aseguramos de tener Vite instalado
RUN npm install

# Exponemos el puerto estándar de Vite Dev (5173)
EXPOSE 5173

# ¡CLAVE! Añadimos -- --host para que escuche las peticiones de Minikube
CMD ["npm", "run", "dev", "--", "--host"]