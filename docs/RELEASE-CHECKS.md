# Release checks — 2026-09-27

## Automated checks

`npm test`: 10 checks passed before deployment. They cover preview noindex, 14 unique canonical URLs with reciprocal language alternatives, lazy codecs, decimal byte limits, invalid settings, MIME-less filenames, filename sanitation, ZIP collision handling and ICO structure.

## Browser checks completed on local production build

Chrome, Playwright CLI; artifacts are local under ignored `output/playwright/`.

| Check | Observed result |
|---|---|
| Sample → JPG at 200 KB | 120,721 bytes; 1200 × 800; marked within target |
| Unit conversion | 200 KB ↔ 0.2 MB; empty target does not throw or change unit |
| Resize + WebP | 300 × 200; 4,312 bytes; real WebP MIME |
| ICO | One directory entry, offset 22, 256 × 171, actual ICO MIME |
| HEIC → JPG | Public libheif `examples/example.heic` → JPG 1280 × 854, 305,197 bytes |
| Failure in middle of batch | Red PNG, invalid PNG, blue PNG → 2 successes, 1 failure; queue completed |
| PNG transparency → JPG | Transparent corner became white; each image retained its own colored center |
| Individual downloads | Files saved to disk through browser download events |
| ZIP with duplicate names | `duplicate.jpg` and `duplicate (1).jpg`; each entry exactly matched its individually downloaded bytes |
| Offline | Explicit offline save, network disabled, navigate to another task, WebP conversion successful |
| Update action | Waiting worker activated and page reloaded with no retained results |
| Cancel and restart | Cancelled an 8-file batch, then completed a fresh sample conversion |
| Mobile | 360 × 800, upload above settings, no horizontal overflow; light/dark screenshots inspected |
| Errors | No uncaught application errors in the tested flows; canvas-readback performance warnings came from QA pixel inspection |

The sample file-size numbers depend on browser encoders; they are observations, not universal compression promises. The HEIC fixture comes from [libheif](https://github.com/strukturag/libheif/blob/master/examples/example.heic) and is not shipped with the site.

## Limits of this verification

- Safari/iOS hardware, unusual HEIC variants, TIFF orientation and low-memory devices have not been comprehensively tested.
- Docker Engine was not running; Docker build/Nginx runtime validation remains pending.
- Search Console ownership verification and sitemap submission require the owner's Google session/token. No index coverage, traffic or conversion rate is claimed without those data.

## Production verification

Published to the existing Netlify Free site on 2026-09-27, deployment `6ab9409fb245cdabc96dc47d`, application version `c87034776468`. [Deployment record](https://app.netlify.com/projects/anh-gon-vn/deploys/6ab9409fb245cdabc96dc47d).

- All 14 canonical routes returned HTTP 200 with HTTPS self-canonical, language alternatives, indexable robots and one H1.
- Sitemap contains 14 URLs; robots references the production sitemap.
- Unknown URL returned 404; `/en/index.html` returned 301 to `/en/`.
- A fresh browser loaded no vendor codec initially. The 200 KB sample produced a 120,721-byte JPG; both image and ZIP were saved to disk.
- Real WebP input converted to JPG, 300 × 200. The language switch retained the WebP→JPG task.
- Mobile 360 px had no horizontal overflow. No uncaught application errors or non-GET requests were observed during these processing flows.
- Final production build was rechecked in a new browser context: first service worker installation does not show an update prompt; sample compression and saved download passed again.

The first source upload returned a Netlify server 500. A second upload containing only the 30 required source/build files (3.93 MB uncompressed) succeeded. No paid feature, Functions or Edge Functions was deployed.
