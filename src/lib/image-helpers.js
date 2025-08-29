// src/lib/image-helpers.js
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export const SIZES = [350, 720, 1080, 1920]; // ajusta si quieres

export function sanitizeName(name) {
  return String(name)
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_.-]/g, "")
    .replace(/_+/g, "_");
}

export function isImage(mimetype, ext) {
  const okMime = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mimetype);
  const okExt  = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext);
  return okMime && okExt;
}

export function baseNameAndExt(filename) {
  const ext = path.extname(filename).toLowerCase();
  const base = path.basename(filename, ext);
  return { base, ext };
}

export async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Genera variantes responsivas:
 * - WebP (ligero) -> base-350w.webp, ...
 * - Fallback en el mismo formato original -> base-350w.jpg|png|webp
 */
export async function generateResponsiveVariants(buffer, outDir, base, origExt) {
  const tasks = [];

  for (const w of SIZES) {
    // WEBP
    const outWebp = path.join(outDir, `${base}-${w}w.webp`);
    tasks.push(
      sharp(buffer)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outWebp)
    );

    // Fallback en el formato original
    const outOrig = path.join(outDir, `${base}-${w}w${origExt}`);
    const pipeline = sharp(buffer).resize({ width: w, withoutEnlargement: true });

    if (origExt === ".jpg" || origExt === ".jpeg") {
      tasks.push(pipeline.jpeg({ quality: 82, mozjpeg: true }).toFile(outOrig));
    } else if (origExt === ".png") {
      tasks.push(pipeline.png({ compressionLevel: 9, palette: true }).toFile(outOrig));
    } else if (origExt === ".webp") {
      tasks.push(pipeline.webp({ quality: 82 }).toFile(outOrig));
    } else if (origExt === ".gif") {
      // GIF animado: mejor dejar original sin variantes (sharp rasteriza)
      // Si lo quieres rasterizar a un fotograma, descomenta:
      // tasks.push(pipeline.jpeg({ quality: 82 }).toFile(outOrig.replace(/\.gif$/, ".jpg")));
    }
  }

  await Promise.all(tasks);
}

export function publicUrlFor(fileName, baseUrl = process.env.DOMINIO, prefix = "") {
  // baseUrl ej: https://codigomarret.online/upload
  // prefix   ej: /img
  const b = String(baseUrl || "").replace(/\/+$/, "");
  const p = String(prefix || "").replace(/\/+$/, "");
  const n = encodeURIComponent(fileName);
  return `${b}${p ? "/" + p : ""}/${n}`;
}



export async function saveResponsive(EDFile, destPath, baseName, ext) {
  const sizes = [350, 720, 1080, 1920];
  for (const s of sizes) {
    // versión webp
    await sharp(EDFile.data)
      .resize({ width: s })
      .toFormat("webp", { quality: 80 })
      .toFile(path.join(destPath, `${baseName}-${s}w.webp`));

    // versión original (png/jpg)
    await sharp(EDFile.data)
      .resize({ width: s })
      .toFormat(ext)
      .toFile(path.join(destPath, `${baseName}-${s}w.${ext}`));
  }

  // original (sin sufijo)
  await sharp(EDFile.data)
    .toFile(path.join(destPath, `${baseName}.${ext}`));
}
