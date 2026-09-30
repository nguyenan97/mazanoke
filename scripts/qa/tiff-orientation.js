async (page) => {
  const result = await page.evaluate(async () => {
    const app = document.querySelector('script[type="module"][src]').src;
    const { processImage, openImage } = await import(new URL('image-engine.js', app));
    const { loadCodec } = await import(new URL('codec-loader.js', app));
    const utif = await loadCodec('tiff');
    const colors = [[255,0,0],[0,255,0],[0,0,255],[255,255,0],[255,0,255],[0,255,255]];
    const pixels = new Uint8Array(30 * 20 * 4);
    for (let y = 0; y < 20; y++) for (let x = 0; x < 30; x++) {
      pixels.set([...colors[Math.floor(y / 10) * 3 + Math.floor(x / 10)], 255], (y * 30 + x) * 4);
    }
    // Independent expected visual positions from TIFF 6.0 Orientation tag 274.
    const expected = [[0,1,2,3,4,5],[2,1,0,5,4,3],[5,4,3,2,1,0],[3,4,5,0,1,2],
      [0,3,1,4,2,5],[3,0,4,1,5,2],[5,2,4,1,3,0],[2,5,1,4,0,3]];
    const cases = [];
    for (let orientation = 1; orientation <= 8; orientation++) {
      const buffer = utif.encodeImage(pixels.buffer, 30, 20, { t274:[orientation] });
      const result = await processImage(new File([buffer], `orientation-${orientation}.tiff`, { type:'image/tiff' }),
        { mode:'quality', quality:100, format:'image/png', maxDimension:0, allowResize:false }, new AbortController().signal);
      const image = await openImage(result.blob);
      const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently:true }); ctx.drawImage(image, 0, 0);
      const actual = [];
      for (let y = 5; y < canvas.height; y += 10) for (let x = 5; x < canvas.width; x += 10) {
        const rgba = ctx.getImageData(x, y, 1, 1).data;
        actual.push(colors.findIndex(color => color.every((channel, i) => Math.abs(channel - rgba[i]) <= 1) && rgba[3] === 255));
      }
      const width = orientation >= 5 ? 20 : 30, height = orientation >= 5 ? 30 : 20;
      cases.push({ orientation, width:result.width, height:result.height, actual, expected:expected[orientation - 1],
        passed:result.width === width && result.height === height && JSON.stringify(actual) === JSON.stringify(expected[orientation - 1]) });
    }
    return { passed:cases.every(item => item.passed), cases };
  });
  if (!result.passed) throw new Error('TIFF orientation regression: ' + JSON.stringify(result.cases));
  return result;
}
