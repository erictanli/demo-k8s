FROM node:22.22.0-alpine
WORKDIR /app
ARG BUILD_TAG=local
ARG BUILD_SHA=uncommitted
ARG BUILD_TIME=unknown
ENV NODE_ENV=production PORT=8080 BUILD_TAG=${BUILD_TAG} BUILD_SHA=${BUILD_SHA} BUILD_TIME=${BUILD_TIME}
LABEL org.opencontainers.image.revision=${BUILD_SHA} org.opencontainers.image.version=${BUILD_TAG} org.opencontainers.image.created=${BUILD_TIME}
COPY --chown=node:node server.mjs ./
COPY --chown=node:node public ./public
USER node
EXPOSE 8080
CMD ["node", "server.mjs"]
