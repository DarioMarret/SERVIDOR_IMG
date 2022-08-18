"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateResult = void 0;

var _expressValidator = require("express-validator");

const validateResult = (req, res, next) => {
  try {
    (0, _expressValidator.validationResult)(req).throw();
    return next();
  } catch (err) {
    res.status(405);
    res.json({
      errors: err.array()
    });
  }
};

exports.validateResult = validateResult;