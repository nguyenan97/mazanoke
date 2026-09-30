# Release checks — 2026-09-27 / review 2026-09-30

## Automated checks

`npm test`: 11 checks passed in the 2026-09-28 review. They cover preview noindex, 14 unique canonical URLs with reciprocal language alternatives, lazy codecs, decimal byte limits, invalid settings, MIME-less filenames, filename sanitation, ZIP collision handling, ICO structure and switching to quality mode after clearing the unused target. The build check also verifies the Search Console token appears on the production homepage and not on preview pages.

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
- Search Console ownership was verified and the sitemap submitted on 2026-09-28. Search performance data is still processing; no traffic or conversion rate is claimed.

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

## Review and Search Console — 2026-09-28

- Reproduced and fixed a user-facing validation bug: clearing the target size, then switching to quality mode, left a hidden invalid field that blocked image processing. Quality mode now normalizes an invalid unused target; target mode still rejects invalid limits.
- Production browser regression passed: clear target → quality mode → sample processed successfully → actual JPG saved to disk.
- Deployment `6aba77db68c13400d1c0ae8e`, version `1f6966c8046c`, is ready on production. All 14 routes, HTTPS canonical/hreflang, sitemap, redirect and 404 checks passed again.
- Google displayed **Ownership verified** using the HTML tag for the exact HTTPS URL-prefix property. The public verification token is persisted in site config.
- Google displayed **Sitemap submitted successfully**. Its initial report then showed **Couldn't fetch / Sitemap could not be read**, with zero discovered pages. Submission and successful processing are distinct states.
- Direct requests to `/sitemap.xml` returned HTTP 200, no redirect and `application/xml`, including a request with compression disabled. XML contains 14 absolute HTTPS URLs. `/robots.txt` returned 200 and allows crawling. A Googlebot User-Agent alone does not prove access from Google's crawler infrastructure.

## Follow-up review — 2026-09-30

- Reviewed the persisted Google Live Test from 2026-09-28: sitemap **URL is available to Google**, crawled as Google Inspection Tool smartphone, **Crawl allowed: Yes**, **Page fetch: Successful**, **Indexing allowed: Yes**. This validates access from Google's inspection infrastructure; it does not mean tool pages are indexed.
- Search Console Sitemaps now reports **Success**, **14 discovered pages**, last read **2026-09-29**. The initial Couldn't fetch status has resolved. No sitemap resubmission or hosting change was needed.
- Homepage URL Inspection reports **Discovered - currently not indexed**, with this sitemap as its discovery source. It has no last crawl yet.
- Attempted homepage Request indexing once. Google returned **Quota Exceeded** and did not accept the request. No further manual requests or CAPTCHA actions were attempted. Automatic discovery through the successful sitemap remains available.
- Re-ran all 11 automated checks and the production HTTP checks: passed. Production remains version `1f6966c8046c`, with all 14 canonical routes returning 200, sitemap containing 14 URLs, unknown routes returning 404 and `/en/index.html` redirecting with 301.
- Performance baseline observed on 2026-09-30: default 3-month Web report shows **0 clicks**, **0 impressions**, **No data** in Queries; the displayed chart currently covers only 2026-09-27. This is the available Google Search report, not a measurement of direct visits or image processing.
- Remaining external condition: Google crawling and indexing. Search Console discovery counts are not indexed-page counts or product usage. Review Page indexing and Performance when new data exists; adding languages or duplicate landing pages is not justified by current data.
