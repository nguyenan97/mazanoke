# Ảnh Gọn / AnhGon

Free Vietnamese and English image tools. Compress, convert and resize batches in your browser; images stay on your device.

[Tiếng Việt](https://anh-gon-vn.netlify.app/) · [English](https://anh-gon-vn.netlify.app/en/) · [Free growth plan](docs/SEO-GROWTH-PLAN.md) · [Deployment](docs/NETLIFY-VI.md)

![AnhGon: a locally generated sample compressed to a 200 KB target](.github/images/anhgon/desktop-vi.png)

[Mobile demo](.github/images/anhgon/mobile-en.png) · [Demo scripts and sharing drafts](docs/LAUNCH-KIT.md)

This GPL-3.0 fork is built from [MAZANOKE by civilblur](https://github.com/civilblur/mazanoke). Upstream credits and third-party notices are preserved in [ATTRIBUTIONS](docs/ATTRIBUTIONS.md).

## Features

- JPG, PNG and WebP compression, file-size targets, proportional resize.
- HEIC/HEIF and TIFF decoding; browser-supported AVIF/GIF/SVG/ICO input; JPG/PNG/WebP/ICO output.
- Five task pages in each language, including 200 KB, HEIC→JPG and WebP→JPG.
- Batch results, individual downloads, ZIP with collision-safe filenames, cancellation and per-file errors.
- Light/dark themes, local sample image, drag/drop, paste, optional offline download.
- Self-hosted Pico CSS 2.1.1 inputs, Choices.js 11.2.4 dropdowns and selected Lucide SVG icons, with a light green theme and responsive cards.
- Static task guides and measured examples, contextual links, canonical/hreflang, WebPage/WebSite/breadcrumb structured data, sitemap, real 404 and noindex previews.
- No image upload API, accounts, analytics, ads, database or paid service dependency.

JPG uses a white background; EXIF is removed and animated inputs become still images. Results may exceed a target or become larger than the input. Limits: 50 files/batch, 50 MB/file, 40 megapixels decoded, 100 MB retained results, 75 MB ZIP input. Browser/device memory can impose lower practical limits.

## Development

Node.js 20+. Build tools are locked dev dependencies; the published site has no Node runtime or npm installation requirement.

```sh
npm ci
npm test
npm run check
npm run build
npm start
```

Open `http://127.0.0.1:4173`. Root `index.html` is a build template; serve generated `dist/`, not the raw source. Local/preview builds are noindex. To exercise the service worker locally, run `node scripts/build-netlify.mjs --production` before starting the server.

Content and routes: `content/pages.mjs`; editorial guides: `content/guides.mjs`. Translations: `locales/`. Site identity: `config/site.json`. Active application modules: `assets/js/app.js`, `core.js`, `image-engine.js`, `codec-loader.js`, `theme.js`, `ui-icons.js`. Pico modules are configured in `assets/css/pico-theme.scss`, with application styles in `assets/css/app.css`. The generator compiles Pico with Sass, minifies CSS/JavaScript with esbuild, and inlines the small theme initializer before paint. Informational pages omit the processing application. Legacy upstream modules remain as reference but are not shipped by the generator.

## Hosting

The existing Netlify Free project builds static `dist/`; no Functions or paid add-ons. Git continuous deployment is not currently linked. See [Netlify operations](docs/NETLIFY-VI.md).

Alternatively, run `docker compose up --build -d` and visit `http://localhost:3474`. See [Docker configuration](docs/configuration.md). Docker runtime, route handling and optional authentication/restart passed local smoke checks on 2026-09-30.

## Batch releases

Keep changes local until the release plan and QA are complete. `npm run check` runs automated checks and validates the production build without deploying. After committing, `npm run release:prepare` creates a local candidate with file checksums under ignored `.netlify/release-candidates/`.

`npm run check:production` performs read-only HTTP/SEO checks on the configured production site and saves a local JSON report under ignored `output/verification/`. It does not deploy or request indexing. See the [2026-10-03 production and Search Console review](docs/REVIEW-2026-10-03.md).

GitHub CI verifies local browser flows, TIFF orientation and Docker on a standard public-repository runner. It has no Netlify deployment step. Publish one production release after the batch passes QA and the owner authorizes deployment; see [release policy](docs/RELEASE-POLICY.md).

## Verification and license

[Release checks](docs/RELEASE-CHECKS.md) distinguish completed browser checks from unverified environments. [GPL-3.0 license](LICENSE) and [third-party attributions](docs/ATTRIBUTIONS.md) apply.
