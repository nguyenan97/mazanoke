async (page) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const origin = new URL(page.url()).origin;
  await page.goto(origin + '/en/heic-to-jpg/');
  await page.locator('#files').setInputFiles('output/playwright/example.heic');
  await page.locator('#notice').filter({ hasText:'Finished: 1 ready, 0 failed.' }).waitFor();
  const heic = await page.locator('.download-image').evaluate(async link => {
    const blob = await (await fetch(link.href)).blob(), image = await createImageBitmap(blob);
    const result = { type:blob.type, width:image.width, height:image.height }; image.close(); return result;
  });
  if (heic.type !== 'image/jpeg' || heic.width !== 1280 || heic.height !== 854) throw new Error('HEIC fixture failed');
  await page.locator('#clear').click();
  await page.getByRole('listbox', { name:'Output format', exact:true }).click();
  await page.getByRole('option', { name:'ICO', exact:true }).click();
  await page.locator('#sample').click();
  await page.locator('#notice').filter({ hasText:'Finished: 1 ready, 0 failed.' }).waitFor();
  const ico = await page.locator('.download-image').evaluate(async link => {
    const blob = await (await fetch(link.href)).blob(), data = new DataView(await blob.arrayBuffer());
    return { type:blob.type, count:data.getUint16(4, true), offset:data.getUint32(18, true), width:data.getUint8(6) || 256 };
  });
  if (ico.type !== 'image/x-icon' || ico.count !== 1 || ico.offset !== 22 || ico.width !== 256) throw new Error('ICO failed');
  await page.locator('#clear').click();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.locator('#offline').click();
  await page.locator('#offline-status').filter({ hasText:'Offline files saved for both languages' }).waitFor();
  await page.context().setOffline(true);
  let offline;
  try {
    await page.getByRole('link', { name:'Convert to WebP', exact:true }).click();
    await page.locator('#sample').click();
    await page.locator('#notice').filter({ hasText:'Finished: 1 ready, 0 failed.' }).waitFor();
    offline = await page.locator('.download-image').evaluate(async link => (await (await fetch(link.href)).blob()).type);
    if (offline !== 'image/webp') throw new Error('Offline conversion failed');
  } finally { await page.context().setOffline(false); }
  if (errors.length) throw new Error(errors.join(';'));
  return { passed:true, heic, ico, offline, errors };
}
