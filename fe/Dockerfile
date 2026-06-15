FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@11.0.9 --activate
ENV CI=true

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --no-frozen-lockfile

COPY . .
EXPOSE 5173
CMD ["pnpm", "run", "dev"]