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

- Safari/iOS hardware, unusual HEIC variants and low-memory devices have not been comprehensively tested. TIFF orientation now has a dedicated eight-orientation pixel check below.
- Docker was initially unverified; local build/Nginx route/auth/restart checks were completed in the quota-saving follow-up below.
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

## Quota-saving local release — 2026-09-30

**No Netlify deployment was performed in that local-only batch.** Production at its completion remained version `1f6966c8046c`; the local application build was `64363715005d`. The later authorized UI release is recorded separately below.

- Reproduced TIFF tag 274 being ignored: orientation 1 passed, orientations 2–8 failed. Implemented all flips/rotations and dimension swaps. Independently defined six-color pixel expectations now pass all 8 cases on Chrome and Playwright WebKit. Fixture generated locally with bundled UTIF; no proprietary image is used. [TIFF 6.0 Orientation specification](https://image-js.github.io/tiff/media/TIFF6.pdf), [UTIF API](https://github.com/photopea/UTIF.js).
- Chrome and WebKit browser flows passed: JPG sample at/below 200,000 bytes, quality mode after clearing hidden target, 300 × 200 WebP output, actual image and ZIP saved, matching task after language switch, light/dark and no mobile overflow. No uncaught application errors or non-GET image requests in these flows.
- WebKit with iPhone 15 emulation additionally passed HEIC fixture → JPG 1280 × 854, valid 256 px ICO, explicit offline save → network disabled → navigate → WebP conversion. This is WebKit on Windows, not physical Safari/iOS validation.
- Started Docker Desktop and built the image. Found a real Windows CRLF failure: container restarted with `basicauth.sh: not found`. Dockerfile now strips CRLF; `.gitattributes` keeps shell scripts LF on future checkouts.
- Docker smoke passed all 14 routes and assets, noindex for local instances, real 404, explicit index 301, optional Basic authentication covering HTML/robots/sitemap/JS, and authentication after restart. Disposable test containers were removed.
- `npm run check` passes the 11 existing automated checks plus independent production-output checks for unique metadata, internal links, exact language pairs, sitemap, robots and redirect rules.
- Added GitHub verification workflow for the public repo with standard Ubuntu runner, read-only contents permission, browser regression and Docker smoke. It has no Netlify credentials or deploy step.
- First Ubuntu CI run exposed a Node 22 test-discovery incompatibility in `node --test tests`; the runner now enumerates explicit `.test.mjs` files consistently across Node versions and Windows/Linux shells.
- Corrected workflow **passed** on Ubuntu 24.04 / Node 22, commit `8fe60ca`: [GitHub CI run 36723499637](https://github.com/nguyenan97/mazanoke/actions/runs/36723499637). This includes production checks, actual Chrome download/ZIP flows, all eight TIFF orientations and Docker route/auth/restart checks. Actions are SHA-pinned and Playwright CLI is pinned to the locally verified version `0.1.22`.
- Added local-only `release:prepare`: clean Git revision, successful checks, copied static files and SHA-256 manifest. Candidate stays under ignored `.netlify/release-candidates/`.
- Prepared static candidate has 43 files, 4,064,985 bytes, application version `64363715005d`. SHA-256/size verification passed for every file. Candidate production origin remains `https://anh-gon-vn.netlify.app`; no paid service or extra language was added.
- Prepared real sample screenshots and Vietnamese/English sharing drafts in `LAUNCH-KIT.md`; nothing was posted to external communities. Screenshot/build-size values are browser-specific observations.

## UI completion before publish, 2026-09-30

- Application version `48ef738bb1d5`; replaces the previous candidate while retaining TIFF and Docker fixes.
- Reworked the interface with neutral surfaces, green controls, task navigation, simpler result rows and shorter task-specific headings. Removed decorative badges/eyebrow copy and em dashes from visible content. Select controls have no border or shadow; native selection and keyboard focus remain available.
- `npm run check`: all 11 checks and independent validation of all 14 production pages pass.
- Chrome and WebKit regression passed JPG within 200,000 bytes, quality mode after clearing unused target, 300 × 200 WebP, actual JPG/ZIP downloads, matching task after language switch, and light/dark toggles. No page errors or non-GET image requests in these flows.
- TIFF orientations 1–8 passed again in both browsers. WebKit passed HEIC 1280 × 854, valid ICO and offline navigation/conversion again.
- Inspected new desktop Vietnamese, mobile English and dark mobile screenshots. All 14 routes fit a 360 px viewport. Keyboard ArrowUp/Tab changes compression mode and hides the unused target; all three selects have computed border `0px`, shadow `none` and appearance `none`.
- Owner authorized one production deployment after QA/CI. This section records local results only; publish and production results will be recorded after they succeed.
