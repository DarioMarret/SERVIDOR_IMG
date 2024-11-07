import cors from 'cors'
import express from 'express'
import fileUpload from 'express-fileupload'
import fs from 'fs'
import morgan from 'morgan'
import path from 'path'

// import './function/DeleteImagenDir'
import 'dotenv/config'

const app = express()
const port = process.env.PORT || 4000


app.use(cors(
    {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.json({
    limit: '50mb',
    extended: true
}));

app.use(fileUpload({
    limits: { 
        fileSize: 505500000,
        fieldSize: 555242880
    },
}))

app.use("/", express.static(path.join(__dirname, './public/')))
app.use("/img", express.static(path.join(__dirname, './public/img')))

app.post("/api/img",async(req, res)=>{
    try {
        // ver si es un documento doc, docx, pdf, xls, xlsx para guardar en la carpeta de documentos
        let EDFile = req.files.image
        let name = EDFile.name.toLowerCase().replace(/ /g, "_").replace(/[^a-z0-9_]/g, "").replace(/_+/g, "_")
        let ruta_archivo = path.join(__dirname, './public/img/')
        EDFile.mv(`${ruta_archivo}${name}`, async function (err) {
            if (err) return res.status(500).send({ message: err })
            return res.status(200).json({success: true, message: 'File upload' ,link:`${process.env.DOMINIO}${name}` ,file:name})
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: error})
    }
})

// buscar imagenes por parametro search
app.get("/api/search_image",(req, res)=>{
    const search = req.query.search
    const RUTA_FOLDER = path.join(__dirname, './public/img/')
    fs.readdir(RUTA_FOLDER, function (err, archivos) {
        if (err) {
            console.log(err);
            res.json({err})
        } else {
            let imagenes = []
            archivos.forEach(element => {
                if(element.includes(search)){
                    imagenes.push(element)
                }
            });
            res.json({imagenes})
        }
    });
})

// servir imagenes, documentos, etc de hasta 100mb
app.get("/api/get_image",(req, res)=>{
    const RUTA_FOLDER = path.join(__dirname, './public/img/')
    fs.readdir(RUTA_FOLDER, function (err, archivos) {
        if (err) {
            console.log(err);
            res.json({err})
        } else {
            res.json({archivos})
        }
    });
})
// eliminar imagen
app.delete("/api/delete_image",(req, res)=>{
    const image_delete = req.query.image_delete 
    console.log(image_delete);
    const RUTA_FOLDER = path.join(__dirname, './public/img/')
    fs.readdir(RUTA_FOLDER, function (err, archivos) {
        if (err) {
            console.log(err);
            return res.json({
                success: false,
                message: err
            })
        } 

        let envio = false
        archivos.forEach(element => {
            if(element === image_delete){
                console.log('imagen eliminada');
                fs.unlinkSync(`${RUTA_FOLDER}${element}`)
                envio = true
            }
        })
        if(envio){
            res.json({success: true, message: 'imagen eliminada'})
        }else{
            res.json({success: false, message: 'imagen no encontrada'})
        }
    });
})


// const RUTA_FOLDER = './src/public/img'
// fs.readdir(RUTA_FOLDER, function (err, archivos) {
//     if (err) {
//         console.log(err);
//         return;
//     }
//     console.log(archivos);
// });

app.listen(port, () => {
    console.log(`Server on port ${port}`);
});