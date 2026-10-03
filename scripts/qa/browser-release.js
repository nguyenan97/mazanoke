async (page) => {
  const errors = [], uploads = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.method() !== 'GET') uploads.push(request.url()); });
  const origin = new URL(page.url()).origin;
  const select = async (label, option) => {
    await page.getByRole('listbox', { name:label, exact:true }).click();
    await page.locator('.choices__list--dropdown.is-active').getByRole('option', { name:option, exact:true }).click();
  };
  await page.goto(origin + '/en/compress-image-to-200kb/');
  const ready = () => page.locator('#notice').filter({ hasText:'Finished: 1 ready, 0 failed.' }).waitFor();
  const inspect = () => page.locator('.download-image').evaluate(async link => {
    const blob = await (await fetch(link.href)).blob();
    const url = URL.createObjectURL(blob), image = new Image();
    try {
      await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = url; });
      return { name:link.download, bytes:blob.size, type:blob.type, width:image.naturalWidth, height:image.naturalHeight };
    } finally { URL.revokeObjectURL(url); }
  });
  await page.locator('#sample').click(); await ready();
  const jpg = await inspect();
  if (jpg.type !== 'image/jpeg' || jpg.bytes > 200000 || jpg.width !== 1200 || jpg.height !== 800) throw new Error('200 KB conversion failed');
  const imageDownload = page.waitForEvent('download'); await page.locator('.download-image').click();
  await (await imageDownload).saveAs('output/playwright/release-sample-' + page.context().browser().browserType().name() + '.jpg');
  const zipDownload = page.waitForEvent('download'); await page.locator('#zip').click();
  await (await zipDownload).saveAs('output/playwright/release-' + page.context().browser().browserType().name() + '.zip');
  await page.locator('#clear').click(); await page.locator('#target').fill(''); await select('Compression', 'By quality');
  await select('Output format', 'JPG'); await page.locator('#sample').click(); await ready();
  const quality = await inspect(); if (quality.type !== 'image/jpeg') throw new Error('Hidden target blocked quality mode');
  await page.locator('#clear').click(); await select('Output format', 'WebP'); await page.locator('#dimensions').fill('300');
  await page.locator('#sample').click(); await ready();
  const webp = await inspect();
  if (webp.type !== 'image/webp' || webp.width !== 300 || webp.height !== 200) throw new Error('WebP resize failed');
  await page.locator('#clear').click();
  await page.getByRole('link', { name:'WebP to JPG', exact:true }).click();
  await page.getByRole('link', { name:'Tiếng Việt', exact:true }).click();
  if (!page.url().endsWith('/webp-sang-jpg/')) throw new Error('Language switch lost task');
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Mobile overflow');
  await page.getByRole('link', { name:'English', exact:true }).click();
  await page.locator('#sample').click(); await ready();
  await page.screenshot({ path:'output/playwright/release-' + page.context().browser().browserType().name() + '.png' });
  await page.locator('#theme').click();
  if (await page.evaluate(() => document.documentElement.dataset.theme) !== 'dark') throw new Error('Dark theme failed');
  await page.locator('#theme').click();
  if (errors.length || uploads.length) throw new Error(JSON.stringify({ errors, uploads }));
  return { passed:true, browser:page.context().browser().browserType().name(), jpg, quality, webp, downloads:2, errors, uploads };
}
