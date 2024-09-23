# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb .
RUN bun install --frozen-lockfile --production

FROM base AS prerelease
COPY . .

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /app/node_modules node_modules
COPY ./src .
COPY --from=prerelease /app/package.json .

# run the app
USER bun
ENTRYPOINT [ "bun", "run", "index.ts" ]