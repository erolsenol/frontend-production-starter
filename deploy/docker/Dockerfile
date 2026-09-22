FROM node:22-alpine AS runtime

RUN corepack enable && corepack prepare pnpm@12.4.2 --activate
WORKDIR /workspace

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter admin build

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["pnpm", "--dir", "apps/admin", "start"]
