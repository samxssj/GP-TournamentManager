# ─────────────────────────────────────────────
# Etapa 1: build del cliente React
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /build

# Instalar dependencias primero (aprovecha la caché de capas)
COPY client/package.json client/package-lock.json* ./client/
RUN npm install --prefix client

# Copiar código fuente y compilar
COPY client/ ./client/
RUN npm run build --prefix client

# ─────────────────────────────────────────────
# Etapa 2: imagen final de producción
# ─────────────────────────────────────────────
FROM node:20-alpine AS final

WORKDIR /app

# Instalar dependencias del servidor (solo producción)
COPY server/package.json server/package-lock.json* ./server/
RUN npm install --omit=dev --prefix server

# Copiar código fuente del servidor
COPY server/ ./server/

# Copiar el build del cliente desde la etapa anterior
# El servidor usa path.join(__dirname, '..', 'client', 'dist')
# donde __dirname = /app/server → el dist debe estar en /app/client/dist
COPY --from=builder /build/client/dist ./client/dist/

EXPOSE 3000

CMD ["node", "server/index.js"]
