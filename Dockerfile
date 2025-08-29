# Usa Node 20 (o 18) sobre Alpine
FROM node:20-alpine AS build

WORKDIR /upload

# Paquetes necesarios para compilar dependencias nativas si es preciso
# (sharp suele traer binarios precompilados, pero en Alpine a veces necesita g++)
RUN apk add --no-cache \
  libc6-compat \
  python3 \
  make \
  g++ \
  tzdata

ENV TZ=America/Guayaquil

# Copiamos solo package*.json primero para cachear npm ci
COPY package*.json ./
# Si usas npm 9+: ci asegura lockfile exacto
RUN npm ci --omit=dev

# Ahora copiamos el resto del código
COPY . .

# (Opcional) construyes si tienes build (TS/Vite/etc.)
# RUN npm run build

# -------- Runtime stage (más liviano) --------
FROM node:20-alpine AS runtime

WORKDIR /upload

RUN apk add --no-cache \
  libc6-compat \
  tzdata

ENV TZ=America/Guayaquil \
    NODE_ENV=production

# Copiamos node_modules desde build
COPY --from=build /upload/node_modules ./node_modules
# Copiamos el código/estático
COPY . .

# Exponer puerto (cámbialo si usas otro)
EXPOSE 4000

# Usa npm start
CMD ["npm", "start"]