import puppeteer from 'puppeteer';
import fs from 'fs';
try {
  const path = puppeteer.executablePath();
  console.log('Chromium path:', path);
  console.log('Exists:', fs.existsSync(path));
} catch(e) {
  console.error('Erro:', e.message);
}
