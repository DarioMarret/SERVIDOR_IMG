import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import fileUpload from 'express-fileupload';
import fs from 'fs';
import mime from 'mime-types';
import morgan from 'morgan';
import path from 'path';
import sharp from 'sharp';

const app = express();
const port = process.env.PORT || 4000;

// ====== rutas base ======
const PUBLIC_DIR = path.join(process.cwd(), 'src', 'public');
const IMG_DIR = path.join(PUBLIC_DIR, 'img');
fs.mkdirSync(IMG_DIR, { recursive: true });

// ====== middlewares ======
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(fileUpload({
  limits: { fileSize: 150 * 1024 * 1024 }, // 150 MB
  useTempFiles: false,
  abortOnLimit: true
}));

// Estáticos con caché fuerte
app.use('/', express.static(PUBLIC_DIR));
app.use('/img', express.static(IMG_DIR, {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));

// ====== helpers ======
const DOMAIN = (process.env.DOMINIO || '').replace(/\/+$/, '') + '/img/';
const IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const IMAGE_EXTS  = new Set(['.jpg','.jpeg','.png','.webp','.gif','.avif','.jfif','.pjpeg','.pjp']);

function sanitizeName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_.-]/g, '')
    .replace(/_+/g, '_');
}

function uniqueName(base, ext) {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 7);
  return `${base}-${ts}-${rnd}${ext}`;
}

// Calidad adaptativa: archivos grandes => más compresión
function qualityBySize(bytes) {
  if (bytes > 8 * 1024 * 1024) return 65;
  if (bytes > 4 * 1024 * 1024) return 72;
  if (bytes > 1 * 1024 * 1024) return 80;
  return 85;
}

// ====== subir y optimizar imagen ======
app.post('/api/img', async (req, res) => {
  try {
    if (!req.files || !('file' in req.files)) {
      return res.status(400).json({ success: false, message: 'No se subió ningún archivo' });
    }

    const f = (req.files).file;
    const mimeType = f.mimetype || mime.lookup(f.name) || '';
    const ext = path.extname(f.name || '').toLowerCase();
    const base = sanitizeName(path.basename(f.name, ext) || 'archivo');

    // Asegura directorio
    fs.mkdirSync(IMG_DIR, { recursive: true });

    // Si NO es imagen, guardar tal cual
    if (!IMAGE_MIMES.has(mimeType) && !IMAGE_EXTS.has(ext)) {
      const rawName = uniqueName(base, ext || '');
      const savePath = path.join(IMG_DIR, rawName);
      await fs.promises.writeFile(savePath, f.data);
      return res.json({
        success: true,
        message: 'Archivo subido (no imagen)',
        link: DOMAIN + rawName,
        file: rawName,
        size: f.size
      });
    }

    // Es imagen → optimizar con sharp
    const maxDim = Number(process.env.IMG_MAX_DIM || 2560); // ancho/alto max
    const q = qualityBySize(f.size);

    // Config para PNG → WebP near-lossless; JPG → WebP con quality
    const isPNG = mimeType.includes('png') || ext === '.png';
    const webpOpts = isPNG
      ? { quality: Math.min(95, q + 5), effort: 4, nearLossless: true }
      : { quality: q, effort: 4 };

    // Pipeline: rotar por EXIF, limitar píxeles, redimensionar si hace falta
    const pipeline = sharp(f.data, { failOn: false, limitInputPixels: 268402689 /* ~16k x 16k */ })
      .rotate()
      .resize({
        width: maxDim,
        height: maxDim,
        fit: 'inside',
        withoutEnlargement: true
      });

    const webpBuffer = await pipeline.webp(webpOpts).toBuffer();

    // Si por alguna razón el WebP es más grande que el original, guarda el original
    let finalBuffer = webpBuffer;
    let finalExt = '.webp';
    if (webpBuffer.length >= f.size) {
      finalBuffer = f.data; // conserva
      finalExt = ext || '.' + (mime.extension(mimeType) || 'bin');
    }

    const finalName = uniqueName(base, finalExt);
    const finalPath = path.join(IMG_DIR, finalName);
    await fs.promises.writeFile(finalPath, finalBuffer);

    return res.json({
      success: true,
      message: finalExt === '.webp'
        ? 'Imagen optimizada y convertida a WebP'
        : 'Imagen se mantuvo en el formato original (más eficiente)',
      link: DOMAIN + finalName,
      file: finalName,
      bytes_in: f.size,
      bytes_out: finalBuffer.length,
      saved_pct: Number(((1 - finalBuffer.length / f.size) * 100).toFixed(2))
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ success: false, message: 'Error procesando el archivo' });
  }
});

// ====== utilidades existentes ======
app.get('/api/search_image', (req, res) => {
  const search = String(req.query.search || '').toLowerCase();
  fs.readdir(IMG_DIR, (err, files) => {
    if (err) return res.json({ err });
    const imagenes = files.filter(f => f.toLowerCase().includes(search));
    res.json({ imagenes });
  });
});

app.get('/api/get_image', (_req, res) => {
  fs.readdir(IMG_DIR, (err, archivos) => {
    if (err) return res.json({ err });
    res.json({ archivos });
  });
});

app.delete('/api/delete_image', (req, res) => {
  const name = String(req.query.image_delete || '');
  const filePath = path.join(IMG_DIR, path.basename(name));
  fs.access(filePath, fs.constants.F_OK, (e) => {
    if (e) return res.json({ success: false, message: 'imagen no encontrada' });
    fs.unlink(filePath, (err) => {
      if (err) return res.json({ success: false, message: 'no se pudo eliminar' });
      res.json({ success: true, message: 'imagen eliminada' });
    });
  });
});

// ====== start ======
app.listen(port, () => {
  console.log(`Server listening on :${port}`);
  console.log(`Serving /img from ${IMG_DIR}`);
});
