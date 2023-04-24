
const multer  = require('multer')
const path = require('path')

const ruta_archivo = path.join(__dirname, '../public/img/')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, ruta_archivo)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname.toLowerCase().replace(/ /g, "_"))
    }
})

const upload = multer({ storage: storage })


module.exports = {
    upload,
}