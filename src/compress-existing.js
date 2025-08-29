// scripts/compress-existing.js
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMG_DIR = path.join(__dirname, "..", "src", "public", "img"); // ajusta si tu carpeta difiere

const QUALITY_JPEG = 80; // ajusta a gusto
const QUALITY_WEBP = 80; // por si tienes .webp
const PNG_LEVEL = 9;     // 0..9 (más alto = más compresión)

const exts = [".jpg", ".jpeg", ".png", ".webp"];

(async () => {
  try {
    if (!fs.existsSync(IMG_DIR)) {
      console.error("No existe la carpeta:", IMG_DIR);
      process.exit(1);
    }

    const files = fs.readdirSync(IMG_DIR);
    let count = 0;

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!exts.includes(ext)) continue;

      const fullPath = path.join(IMG_DIR, file);

      try {
        const input = sharp(fullPath).rotate(); // corrige orientación EXIF
        let buffer;

        if (ext === ".jpg" || ext === ".jpeg") {
          buffer = await input.jpeg({ quality: QUALITY_JPEG }).toBuffer();
        } else if (ext === ".png") {
          buffer = await input.png({ compressionLevel: PNG_LEVEL, adaptiveFiltering: true }).toBuffer();
        } else if (ext === ".webp") {
          buffer = await input.webp({ quality: QUALITY_WEBP }).toBuffer();
        } else {
          continue;
        }

        // sobrescribe el MISMO archivo con la MISMA extensión
        fs.writeFileSync(fullPath, buffer);
        count++;
        console.log(`✅ Comprimido: ${file}`);
      } catch (e) {
        console.warn(`⚠️ Falló: ${file}`, e.message);
      }
    }

    console.log(`\n🎉 Listo. Archivos comprimidos: ${count}`);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
})();
