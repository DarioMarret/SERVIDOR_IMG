"use strict";

var _express = _interopRequireDefault(require("express"));

var _cors = _interopRequireDefault(require("cors"));

var _morgan = _interopRequireDefault(require("morgan"));

var _path = _interopRequireDefault(require("path"));

var _expressFileupload = _interopRequireDefault(require("express-fileupload"));

require("./function/DeleteImagenDir");

require("dotenv/config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const app = (0, _express.default)();
const port = process.env.PORT || 4000;
app.use((0, _cors.default)());
app.use((0, _morgan.default)('dev'));
app.use(_express.default.json());
app.use(_express.default.json({
  limit: '50mb',
  extended: true
}));
app.use((0, _expressFileupload.default)({
  limits: {
    fileSize: 5000000,
    fieldSize: 5242880
  }
}));
app.use("/", _express.default.static(_path.default.join(__dirname, './public/')));
app.use("/img", _express.default.static(_path.default.join(__dirname, './public/img')));
app.post("/api/img", async (req, res) => {
  try {
    let EDFile = req.files.image;
    let name = EDFile.name.toLowerCase().trim();

    let ruta_archivo = _path.default.join(__dirname, './public/img/');

    EDFile.mv(`${ruta_archivo}${EDFile.name.toLowerCase()}`, async function (err) {
      if (err) return res.status(500).send({
        message: err
      });
      return res.status(200).json({
        success: true,
        message: 'File upload',
        link: `${process.env.DOMINIO}${name}`,
        file: name
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error
    });
  }
});
app.get("/api/get_image", (req, res) => {
  const RUTA_FOLDER = _path.default.join(__dirname, './public/img/');

  fs.readdir(RUTA_FOLDER, function (err, archivos) {
    if (err) {
      console.log(err);
      res.json({
        err
      });
    } else {
      res.json({
        archivos
      });
    }
  });
}); // const RUTA_FOLDER = './src/public/img'
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