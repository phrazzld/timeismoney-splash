FROM node:20.19.4-alpine3.22

WORKDIR /app
COPY --chown=node:node server.js ./server.js
COPY --chown=node:node api ./api

ENV NODE_ENV=production
USER node
EXPOSE 8080
CMD ["node", "server.js"]
