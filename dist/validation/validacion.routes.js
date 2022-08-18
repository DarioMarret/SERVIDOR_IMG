"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.save_user = exports.login = void 0;

var _expressValidator = require("express-validator");

var _isEmpty = _interopRequireDefault(require("is-empty"));

var _validateHelper = require("../helper/validateHelper");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * EJEMPLO
 */
const save_user = [(0, _expressValidator.check)("user_id").exists().not().isEmpty().isString(), (0, _expressValidator.check)("id_conversacion").exists().not().isEmpty().isString(), (0, _expressValidator.check)("estado").exists().not().isEmpty().isString(), (0, _expressValidator.check)("channelInfo").isObject().custom((value, {
  req
}) => {
  const {
    path
  } = value;

  if (!(0, _isEmpty.default)(path)) {
    return true;
  } else {
    throw new Error("la peticion no cumple los requisitos en el value channelInfo:{path:'http://conecto:port/ruta'}");
  }
}), (req, res, next) => {
  (0, _validateHelper.validateResult)(req, res, next);
}];
exports.save_user = save_user;
const login = [(0, _expressValidator.check)("usuario").exists().not().isEmpty().isString(), (0, _expressValidator.check)("password").exists().not().isEmpty().isString(), (req, res, next) => {
  (0, _validateHelper.validateResult)(req, res, next);
}];
exports.login = login;