import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json', '.xml':'application/xml', '.txt':'text/plain', '.md':'text/plain; charset=utf-8', '.png':'image/png', '.ico':'image/x-icon', '.woff2':'font/woff2' };
http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    let file = path.resolve(root, `.${pathname}`);
    if (!(file === path.resolve(root) || file.startsWith(root)) || pathname.includes('\\')) { response.writeHead(403); response.end(); return; }
    const entry = await stat(file);
    if (entry.isDirectory()) {
      if (!pathname.endsWith('/')) { response.writeHead(301, { Location:pathname + '/' }); response.end(); return; }
      file = path.join(file, 'index.html');
    }
    const data = await readFile(file);
    response.writeHead(200, { 'Content-Type':mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-cache' }); response.end(data);
  } catch { response.writeHead(404, { 'Content-Type':'text/html; charset=utf-8' }); response.end(await readFile(path.join(root, '404.html')).catch(() => 'Build the site first.')); }
}).listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log('AnhGon ready at http://127.0.0.1:4173'));
