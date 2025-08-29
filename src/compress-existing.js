import fs from "fs";
import path from "path";
import sharp from "sharp";

const IMG_DIR = path.join(__dirname, "./public/img");

(async () => {
  try {
    const files = fs.readdirSync(IMG_DIR);

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      const fullPath = path.join(IMG_DIR, file);

      if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) continue;

      console.log("🔄 Procesando:", file);

      let buffer;

      if (ext === ".jpg" || ext === ".jpeg") {
        buffer = await sharp(fullPath)
          .rotate() // corrige orientación
          .jpeg({ quality: 80 }) // recomprime en jpg
          .toBuffer();
      } else if (ext === ".png") {
        buffer = await sharp(fullPath)
          .png({ compressionLevel: 9, adaptiveFiltering: true })
          .toBuffer();
      } else if (ext === ".webp") {
        buffer = await sharp(fullPath)
          .webp({ quality: 80 })
          .toBuffer();
      }

      // Sobreescribir mismo archivo
      fs.writeFileSync(fullPath, buffer);

      console.log("✅ Comprimido:", file);
    }

    console.log("🎉 Todas las imágenes fueron comprimidas conservando su extensión.");
  } catch (err) {
    console.error("❌ Error procesando imágenes:", err);
  }
})();
