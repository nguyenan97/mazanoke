# Release checks — 2026-09-27 / review 2026-10-03

## SEO completion, 2026-10-03

Local application `d7dc21e4217c`: 14/14 tests and all 14 generated routes passed. Docker build/smoke passed. Browser confirmed matching JPG/WebP sample measurements, HEIC 1280 × 854, quality mode with an empty unused target, theme on info pages, service worker update/offline save and no overflow on 14 routes at 360 px. Lighthouse mobile local SEO/Accessibility/Best Practices 100; LCP 2.8 s versus 3.3 s before. Full results, TBT limitation and release status: [SEO audit](SEO-AUDIT-2026-10-03.md).

## Local UI refresh, 2026-10-03

- Application version `c9fe811b6d52` (Choices.js/range refinement after `918e09c2f3dd`), local preview at `http://127.0.0.1:4183/`. Production still serves `48ef738bb1d5`; this UI batch has not been deployed.
- Applied self-hosted Pico CSS 2.1.1 and selected Lucide SVG icons. Styles and icon module are included in the versioned build and service worker core cache; third-party licenses are published with the build.
- Browser QA: JPG sample 120,721 bytes / 1200 × 800 within the 200,000-byte target; quality mode and WebP resize 300 × 200 / 4.26 KB; individual download and ZIP actions; keyboard ArrowDown/Tab; matching English task after language switch; clear results and service worker update.
- Inspected desktop 1280 px, tablet 820 px, and mobile light/dark 360 px. All 14 routes fit the 360 px viewport, and the choose button is 44 px high. No captured console errors in these flows.
- Explicit offline save reports success for both languages and decoders. Network-disabled operation and physical iPhone/Safari were not repeated for this UI batch.
- Local screenshots and route measurements: ignored `output/playwright/ui-pico-2026-10-03/`. Automated validation remains `npm run check` (11 tests and 14 production-output routes).
- Follow-up: removed outlines and focus shadows from settings inputs/selects; number/select focus uses a subtle background. Browser inspection confirmed border `0px`, outline style `none` and shadow `none` on the focused select and number input. Keyboard Tab still works; `npm run check` passed again.
- Second follow-up: Choices.js 11.2.4 replaces the native popups for mode/unit/format, with rounded local-theme menus and labelled keyboard controls. Vendor files are versioned and included in the offline core; license is preserved.
- The quality slider now updates track fill on initialization and every input event, with explicit WebKit/Mozilla track/thumb styling. Browser QA passed Home/End at 1%/100%, a mouse drag to 35%, and restoration to 80%; displayed value and fill matched before/after losing focus. Custom dropdown keyboard selection, KB → MB → KB conversion, quality mode with empty hidden target, JPG 1200 × 800 / 120.72 KB and WebP 300 × 200 / 1.96 KB passed. Dropdowns fit mobile 360 px and use matching light/dark backgrounds. No captured console errors.
- Existing browser regression scripts now select the visible Choices listboxes/options. These script changes have not yet run in CI; local browser QA above and the 11 automated tests / 14-page output checks passed.

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

## Publish attempt, 2026-09-30

- Source commit `028bee1048b84b6eb81a2ca3f19df9966151ccfc` is pushed to `main`. [CI run 36727499058](https://github.com/nguyenan97/mazanoke/actions/runs/36727499058) completed successfully, including browser/TIFF and Docker smoke.
- Immutable candidate `48ef738bb1d5-028bee1` contains 43 files / 4,064,665 bytes. Every file matches the recorded SHA-256 and byte size.
- Netlify MCP source upload returned HTTP 500 twice, including a fresh staging directory with only 30 required source files. Neither attempt returned a deploy ID. Do not count these attempts as successful production releases or assume a quota error from the 500 response.
- Production was rechecked and still serves application version `1f6966c8046c`, deploy `6aba77db68c13400d1c0ae8e`.
- Netlify CLI is available but reports `Not logged in`; the dashboard browser also reports Unauthorized. Opened CLI authorization for the owner. Direct CLI deploy can use the verified candidate with `--no-build` once authentication succeeds; no paid plan or extra preview is needed.

## Successful UI production release, 2026-09-30

- A later plugin retry also returned HTTP 500 without a deploy ID. The owner's earlier CLI authorization had succeeded; `netlify login --check` completed the session for the verified site owner. No new account or site was created.
- Netlify CLI published the immutable candidate using `deploy --prod --no-build --site <existing-site-id> --dir <candidate-public>`. An initial command with `--context production` was rejected locally because that flag requires a build; removing it allowed the already-built candidate to deploy. No preview or remote build was created.
- Deploy **`6abd1f76eaf01a3a10519b18`** is **ready**, context **production**, published at **2026-09-30T14:40:58Z**, source commit **`028bee1`**, application version **`48ef738bb1d5`**. Build ID is null. Netlify reports 21 changed files, 14 redirect rules and 3 header rules processed, no Functions or Edge Functions. [Deployment record](https://app.netlify.com/projects/anh-gon-vn/deploys/6abd1f76eaf01a3a10519b18).
- Rechecked the production hostname: all 14 canonical routes return 200, self-canonical and vi/en/x-default alternates are present, pages are indexable and have one H1. Sitemap has 14 URLs, robots points to it, missing pages return 404, `/en/index.html` redirects with 301. Production build report matches version `48ef738bb1d5`.
- Fresh Chrome context passed JPG at 120,721 bytes / 1200 × 800 under the 200,000-byte target, quality mode with a cleared unused target, WebP at 4,264 bytes / 300 × 200, actual JPG/ZIP saved to disk, task-preserving locale switch and light/dark. No page errors or non-GET image requests in the tested flows.
- All eight TIFF orientations passed the independent pixel/dimension oracle on production. All 14 live routes fit a 360 px viewport and contain no visible em/en dash. Native selects remain borderless; keyboard mode selection hides the unused target correctly.
- SHA-256 and byte-size verification still passes for all 43 candidate files after publish. The prepared `release.json` records its historical local-only preparation; this section records the later publication.
- Netlify dashboard after publish shows Free **$0**, **224.4 / 300 credits remaining**, **75.6 consumed**, including **5 production deploys / 75 credits**. Current billing period is Sep 26–Oct 25; credits expire Oct 26. Usage can lag by a few minutes. No card, paid upgrade, auto recharge, Functions, Edge Functions or paid analytics was added.
- Technical release is complete. Google indexing, country/query data, physical Safari/iOS verification and any external community posting retain their previously recorded status; publication does not prove those outcomes.

## Production and Search Console review — 2026-10-03

Production remains `48ef738bb1d5`; no deployment was needed. All 11 local tests and 36 live HTTP/SEO checks passed. Actual JPG and ZIP files were saved and their bytes matched; quality-mode regression, WebP resize, locale switch and 360 px light/dark checks passed. Google accepted the homepage indexing request after a successful Live Test. The 200 KB Live Test passed, but its indexing request was rejected by daily quota. Sitemap is Success with 14 discovered pages, last read Oct 2; Performance remains zero clicks/impressions and Page indexing is still processing. Netlify Free remains $0 with 224.3/300 credits remaining. Full observations, verification limits and next checkpoints: [2026-10-03 review](REVIEW-2026-10-03.md).
