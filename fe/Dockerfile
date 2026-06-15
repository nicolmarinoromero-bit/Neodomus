FROM node:22-alpine

# Habilitar pnpm
RUN corepack enable && corepack prepare pnpm@11.0.9 --activate

# Evitar interacción
ENV CI=true

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias (evita problemas de lockfile en primera build)
RUN pnpm install --no-frozen-lockfile

# Copiar el resto del código
COPY . .

EXPOSE 5173

CMD ["pnpm", "run", "dev"]