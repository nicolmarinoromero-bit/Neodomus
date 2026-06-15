FROM node:22-alpine

# Instalar pnpm globalmente
RUN corepack enable && corepack prepare pnpm@11.0.9 --activate

# Evitar interacciones
ENV CI=true

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instalar dependencias ignorando scripts
RUN pnpm install --ignore-scripts

# Reconstruir esbuild manualmente
RUN pnpm rebuild esbuild

# Copiar el resto del código
COPY . .

EXPOSE 5173

CMD ["pnpm", "run", "dev"]
