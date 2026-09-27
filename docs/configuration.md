# Docker configuration

Build this fork with `docker compose up --build -d`, then open `http://localhost:3474`. The Docker build runs the same static generator as Netlify. The old upstream image `ghcr.io/civilblur/mazanoke` does not contain this fork's changes.

The default local image is noindex. For an intentionally public instance, pass build arguments `SITE_URL=https://your-existing-host` and `CONTEXT=production`. SEO is generated at build time; the old `METATAGS` runtime switch is no longer used by this Dockerfile. HTTPS or localhost is required for service worker support.

Optional Basic Auth is enabled only when both runtime variables `USERNAME` and `PASSWORD` are set. It protects the entire server, including translated routes and assets. Do not commit credentials in Compose files. Private instances should remain noindex.

The browser can retain downloaded assets and offline files after sign-in. Basic Auth on the server does not erase a browser's existing offline cache. Avoid saving offline tools on a shared device if that matters for your deployment.

Docker CLI is available in the development environment, but Docker Engine was not running during the 2026-09-27 verification. The image build and Nginx runtime have not been tested there.
