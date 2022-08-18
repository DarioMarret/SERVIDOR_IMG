"use strict";

var _nodeCron = _interopRequireDefault(require("node-cron"));

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_nodeCron.default.schedule('00 00 * * *', async () => {
  const RUTA_FOLDER = './src/public/img';

  _fs.default.readdir(RUTA_FOLDER, function (err, archivos) {
    if (err) {
      console.log(err);
      return;
    } else {
      for (let index = 0; index < archivos.length; index++) {
        let items = archivos[index];

        try {
          _fs.default.unlinkSync(`${RUTA_FOLDER}/${items}`);
        } catch (err) {
          console.error(err);
        }
      }
    }
  });
});