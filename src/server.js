import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import fileUpload from 'express-fileupload';
import fs from 'fs';
import fsp from 'fs/promises'; // 👈 usa fs/promises
import morgan from 'morgan';
import path from 'path';

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

// Estáticos (puedes ajustar cache si lo deseas)
app.use('/', express.static(PUBLIC_DIR));
app.use('/img', express.static(IMG_DIR, {
  setHeaders: (res) => {
    res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  }
}));

// ====== helpers ======
import crypto from "crypto";
import {
  SIZES, // 👈 lo usas para decidir variantes
  baseNameAndExt,
  ensureDir,
  generateResponsiveVariants, // 👈 lo usas al responder
  isImage,
  publicUrlFor,
  sanitizeName
} from './lib/image-helpers.js';

// PROTEGE con un token (ponlo en tu .env)
const COMPRESS_TOKEN = process.env.COMPRESS_TOKEN || crypto.randomBytes(8).toString("hex");

// genera nombre único si ya existe
async function uniquePath(dir, filename) {
  const { base, ext } = baseNameAndExt(filename);
  let candidate = filename;
  let i = 1;
  while (true) {
    try {
      await fsp.access(path.join(dir, candidate));
      // existe -> genera otra variante
      candidate = `${base}-${i}${ext}`;
      i++;
    } catch {
      // no existe -> usar este
      return { file: candidate, base, ext };
    }
  }
}

// ====== subir y optimizar imagen ======
app.post("/api/img", async (req, res) => {
  try {
    const f = req.files?.file || req.files?.image; // acepta "file" o "image"
    if (!f) return res.status(400).json({ success: false, message: "No file" });

    const ext = path.extname(f.name).toLowerCase();
    const mimetype = f.mimetype;
    await ensureDir(IMG_DIR);

    // nombre saneado (conserva extensión original)
    const clean = sanitizeName(f.name);
    const { file: uniqueName } = await uniquePath(IMG_DIR, clean);
    const { base, ext: origExt } = baseNameAndExt(uniqueName);
    const destPath = path.join(IMG_DIR, `${base}${origExt}`);

    // guardar SIEMPRE el original (misma extensión)
    await fsp.writeFile(destPath, f.data);    // 👈 fs/promises

    // si es imagen -> variantes responsive
    let variants = [];
    if (isImage(mimetype, ext)) {
      await generateResponsiveVariants(f.data, IMG_DIR, base, origExt);
      // armar urls
      variants = SIZES.map(w => ({
        w,
        webp: publicUrlFor(`${base}-${w}w.webp`, process.env.DOMINIO, "/img"),
        fallback: publicUrlFor(`${base}-${w}w${origExt}`, process.env.DOMINIO, "/img"),
      }));
    }

    return res.json({
      success: true,
      file: `${base}${origExt}`,
      url: publicUrlFor(`${base}${origExt}`, process.env.DOMINIO, "/img"),
      variants,
      message: "Subida OK",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Upload error" });
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

// elimina archivo principal + variantes (-350w, -720w, ...)
app.delete('/api/delete_image', async (req, res) => {
  const raw = String(req.query.image_delete || '');
  const safe = path.basename(raw); // sanitiza
  if (!safe) return res.json({ success: false, message: 'nombre inválido' });

  const { base, ext } = baseNameAndExt(safe);
  let deletedAny = false;

  try {
    // principal
    await fsp.unlink(path.join(IMG_DIR, safe));
    deletedAny = true;
  } catch {}

  // variantes
  for (const w of SIZES) {
    for (const variant of [
      `${base}-${w}w.webp`,
      `${base}-${w}w${ext}`
    ]) {
      try {
        await fsp.unlink(path.join(IMG_DIR, variant));
        deletedAny = true;
      } catch {}
    }
  }

  if (deletedAny) return res.json({ success: true, message: 'imagen eliminada (incl. variantes)' });
  return res.json({ success: false, message: 'imagen no encontrada' });
});

app.post("/api/compress_all", async (req, res) => {
  try {
    const token = req.headers["x-compress-token"] || req.query.token;
    if (String(token) !== String(COMPRESS_TOKEN)) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const { default: run } = await import("./compress-existing.js"); // asegúrate que exporte default
    await run(); // 👈 si el módulo expone una función, ejecútala

    return res.json({ ok: true, message: "Compresión ejecutada (revisa logs del servidor)" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: "Error ejecutando compresión" });
  }
});

// ====== start ======
app.listen(port, () => {
  console.log(`Server listening on :${port}`);
  console.log(`Serving /img from ${IMG_DIR}`);
});
