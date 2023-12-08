import cron from 'node-cron'
import fs from 'fs'

cron.schedule('00 00 * * *', async () => {
    const RUTA_FOLDER = './src/public/img'
    fs.readdir(RUTA_FOLDER, function (err, archivos) {
        if (err) {
            console.log(err);
            return;
        } else {
            for (let index = 0; index < archivos.length; index++) {
                let items = archivos[index];
                try {
                    fs.unlinkSync(`${RUTA_FOLDER}/${items}`)
                } catch (err) {
                    console.error(err)
                }
            }
        }
    });
});