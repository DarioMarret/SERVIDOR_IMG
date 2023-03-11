import fileUpload from 'express-fileupload'
import express from 'express'
import morgan from 'morgan'
import path from 'path'
import cors from 'cors'
import fs from 'fs'

import './function/DeleteImagenDir'
import 'dotenv/config'


const app = express()
const port = process.env.PORT || 4000


app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.json({
    limit: '50mb',
    extended: true
}));

app.use(fileUpload({
    limits: { 
        fileSize: 5000000,
        fieldSize: 5242880
    },
}))

app.use("/", express.static(path.join(__dirname, './public/')))
app.use("/img", express.static(path.join(__dirname, './public/img')))

app.post("/api/img",async(req, res)=>{
    try {
        let EDFile = req.files.image
        let name = EDFile.name.toLowerCase().replace(/ /g, "_")
        let ruta_archivo = path.join(__dirname, './public/img/')
        EDFile.mv(`${ruta_archivo}${EDFile.name.toLowerCase().replace(/ /g,"_")}`, async function (err) {
            if (err) return res.status(500).send({ message: err })
            return res.status(200).json({success: true, message: 'File upload' ,link:`${process.env.DOMINIO}${name}` ,file:name})
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: error})
    }
})

app.get("/api/get_image",(req, res)=>{
    const RUTA_FOLDER = path.join(__dirname, './public/img/')
    fs.readdir(RUTA_FOLDER, function (err, archivos) {
        if (err) {
            console.log(err);
            res.json({err})
        } else {
            archivos = archivos.map((item)=>{
                return `${process.env.DOMINIO}${item}`
            })
            res.json({archivos})
        }
    });
})

app.listen(port, () => {
    console.log(`Server on port ${port}`);
});