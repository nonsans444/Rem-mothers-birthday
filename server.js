import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const distDir = path.join(__dirname, 'dist');
const indexHtml = path.join(distDir, 'index.html');
const standaloneHtml = path.join(__dirname, 'kamila_urodziny.html');

// Serve static assets from Vite build output if present
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

// Serve standalone gift file
app.get('/gift', (req, res) => {
  if (fs.existsSync(standaloneHtml)) {
    return res.sendFile(standaloneHtml);
  }
  res.redirect('/');
});

// Single Page Application routing fallback
app.get('*', (req, res) => {
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  } else if (fs.existsSync(standaloneHtml)) {
    return res.sendFile(standaloneHtml);
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="pl">
        <head>
          <meta charset="UTF-8">
          <title>M jak Mama – Urodziny Kamili</title>
          <style>
            body { background: #0B0B0D; color: #FF5C8A; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            h1 { font-size: 2rem; margin-bottom: 1rem; }
            p { color: #F2F2F4; }
          </style>
        </head>
        <body>
          <div>
            <h1>M jak Mama – Księga Życzeń</h1>
            <p>Trwa budowanie aplikacji... Proszę uruchomić komendę <code>npm run build</code>.</p>
          </div>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server successfully started on http://0.0.0.0:${PORT}`);
});
