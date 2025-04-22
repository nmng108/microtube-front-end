ARG NODE_VERSION=22
ARG NGINX_VERSION=1.27.2

ARG MAIN_BACKEND_SERVER_ADDRESS=""
ARG MAIN_BACKEND_SERVER_BASE_PATH=""

FROM node:${NODE_VERSION}-alpine AS base
RUN corepack enable
WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml .pnp.* ./
COPY .yarn/ .yarn/
RUN yarn install --immutable --check-cache
COPY vite.config.ts tsconfig.* postcss.config.js tailwind.config.ts index.html ./
COPY src/ src/
COPY public/ public/

FROM base AS development
WORKDIR /app

ARG MAIN_BACKEND_SERVER_ADDRESS
ARG MAIN_BACKEND_SERVER_BASE_PATH
COPY .env* .

ENTRYPOINT ["yarn", "dev"]
CMD ["--host"]

FROM base AS build
WORKDIR /app

ARG MAIN_BACKEND_SERVER_ADDRESS
ARG MAIN_BACKEND_SERVER_BASE_PATH
COPY .env* .
RUN yarn build

FROM nginx:${NGINX_VERSION}-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
