FROM node:22-alpine AS prepare
WORKDIR /app
COPY package.json index.html service-worker.js favicon.ico LICENSE ./
COPY scripts/build-netlify.mjs ./scripts/build-netlify.mjs
COPY config/site.json ./config/site.json
COPY content ./content
COPY locales ./locales
COPY assets ./assets
COPY docs/ATTRIBUTIONS.md ./docs/ATTRIBUTIONS.md
# Local/private instances default to noindex. Set both args for a public site.
ARG SITE_URL=http://localhost:3474
ARG CONTEXT=local
RUN SITE_URL="$SITE_URL" CONTEXT="$CONTEXT" node scripts/build-netlify.mjs

FROM nginx:alpine
RUN apk add --no-cache apache2-utils
COPY scripts/basicauth.sh /usr/local/bin/basicauth.sh
RUN sed -i 's/\r$//' /usr/local/bin/basicauth.sh && chmod +x /usr/local/bin/basicauth.sh
COPY config/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=prepare /app/dist /usr/share/nginx/html

ARG VERSION
ARG REVISION
ARG CREATED
LABEL org.opencontainers.image.title="AnhGon" \
      org.opencontainers.image.description="Free Vietnamese and English image tools, processed on your device" \
      org.opencontainers.image.url="https://github.com/nguyenan97/mazanoke" \
      org.opencontainers.image.source="https://github.com/nguyenan97/mazanoke" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${REVISION}" \
      org.opencontainers.image.created="${CREATED}"
EXPOSE 80
CMD ["/bin/sh", "-c", "/usr/local/bin/basicauth.sh && nginx -g 'daemon off;'"]
