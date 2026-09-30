async (page) => {
  const origin = new URL(page.url()).origin;
  const mobile = page.context().browser().browserType().name() === 'webkit';
  if (await page.locator('#reload').isVisible()) {
    if (!(await page.locator('#clear').isDisabled())) await page.locator('#clear').click();
    const reload = page.waitForEvent('load'); await page.locator('#reload').click(); await reload;
  }
  await page.evaluate(() => { localStorage.removeItem('anhgon-settings-v2'); localStorage.removeItem('anhgon-theme'); });
  await page.goto(origin + (mobile ? '/en/compress-image-to-200kb/' : '/nen-anh-200kb/'));
  if (!mobile) await page.setViewportSize({ width:1280, height:960 });
  await page.locator('#sample').click();
  await page.locator('.download-image').waitFor();
  await page.locator('#cancel').waitFor({ state:'hidden' });
  await page.evaluate(() => scrollTo(0, 0));
  const image = '.github/images/anhgon/' + (mobile ? 'mobile-en.png' : 'desktop-vi.png');
  await page.screenshot({ path:image, fullPage:mobile, scale:'css' });
  return { image, sampleResult:await page.locator('.result-meta').innerText() };
}
