import fileUpload from 'express-fileupload'
import express from 'express'
import morgan from 'morgan'
import path from 'path'
import cors from 'cors'
import fs from 'fs'


import './function/DeleteImagenDir'
import 'dotenv/config'
import {upload, storage } from './lib'
const {multipartFileParser} = require('express-multipart-form-data-process');


const app = express()
const port = process.env.PORT || 4000


app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
// app.use(express.json({
//     limit: '50mb',
//     extended: true
// }));


// app.use(fileUpload({
//     limits: { fileSize: 50 * 1024 * 1024 },
//   }))
app.use(multipartFileParser({
    rawBodyOptions: {
        limit: '50mb',
    },
}))

app.use("/", express.static(path.join(__dirname, './public/')))
app.use("/img", express.static(path.join(__dirname, './public/img')))

app.post("/api/img",upload.single("image") ,(req, res, next)=>{
    const file = req.file
    if(!file){
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next(error)
    }
    const name = req.file.filename
    res.status(200).json({success: true, message: 'File upload' ,link:`${process.env.DOMINIO}${name}` ,file:name})
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