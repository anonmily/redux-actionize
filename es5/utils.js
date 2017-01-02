"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.upper = upper;
exports.lower = lower;
exports.proper = proper;
exports.to_underscore = to_underscore;

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function upper(str) {
    return str ? String(str).toUpperCase() : "";
} // Miscellaneous Tools/Utilities
function lower(str) {
    return str ? String(str).toLowerCase() : "";
}

function proper(str) {
    if (str) {
        var result = "";
        _lodash2.default.words(str).forEach(function (word, index) {
            if (index !== 0) {
                result += ' ';
            }
            result += _lodash2.default.upperFirst(word);
        });
        return result;
    } else {
        return "";
    }
}

function to_underscore(str) {
    return lower(str).trim().replace(/[ -]+/g, "_");
}