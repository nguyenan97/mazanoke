# Ảnh Gọn / AnhGon

Free Vietnamese and English image tools. Compress, convert and resize batches in your browser; images stay on your device.

[Tiếng Việt](https://anh-gon-vn.netlify.app/) · [English](https://anh-gon-vn.netlify.app/en/) · [Free growth plan](docs/SEO-GROWTH-PLAN.md) · [Deployment](docs/NETLIFY-VI.md)

This GPL-3.0 fork is built from [MAZANOKE by civilblur](https://github.com/civilblur/mazanoke). Upstream credits and third-party notices are preserved in [ATTRIBUTIONS](docs/ATTRIBUTIONS.md).

## Features

- JPG, PNG and WebP compression, file-size targets, proportional resize.
- HEIC/HEIF and TIFF decoding; browser-supported AVIF/GIF/SVG/ICO input; JPG/PNG/WebP/ICO output.
- Five task pages in each language, including 200 KB, HEIC→JPG and WebP→JPG.
- Batch results, individual downloads, ZIP with collision-safe filenames, cancellation and per-file errors.
- Light/dark themes, local sample image, drag/drop, paste, optional offline download.
- Static HTML for search engines, canonical/hreflang, sitemap, real 404 and noindex previews.
- No image upload API, accounts, analytics, ads, database or paid service dependency.

JPG uses a white background; EXIF is removed and animated inputs become still images. Results may exceed a target or become larger than the input. Limits: 50 files/batch, 50 MB/file, 40 megapixels decoded, 100 MB retained results, 75 MB ZIP input. Browser/device memory can impose lower practical limits.

## Development

Node.js 20+; no npm runtime dependencies required.

```sh
npm test
npm run build
npm start
```

Open `http://127.0.0.1:4173`. Root `index.html` is a build template; serve generated `dist/`, not the raw source. Local/preview builds are noindex. To exercise the service worker locally, run `node scripts/build-netlify.mjs --production` before starting the server.

Content and routes: `content/pages.mjs`. Translations: `locales/`. Site identity: `config/site.json`. Active application modules: `assets/js/app.js`, `core.js`, `image-engine.js`, `codec-loader.js`, `theme.js`. Legacy upstream modules remain as reference but are not shipped by the generator.

## Hosting

The existing Netlify Free project builds static `dist/`; no Functions or paid add-ons. Git continuous deployment is not currently linked. See [Netlify operations](docs/NETLIFY-VI.md).

Alternatively, run `docker compose up --build -d` and visit `http://localhost:3474`. See [Docker configuration](docs/configuration.md). Docker runtime validation is pending because the local engine was not running.

## Verification and license

[Release checks](docs/RELEASE-CHECKS.md) distinguish completed browser checks from unverified environments. [GPL-3.0 license](LICENSE) and [third-party attributions](docs/ATTRIBUTIONS.md) apply.
