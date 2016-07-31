"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.upper = upper;
exports.lower = lower;
// Miscellaneous Tools/Utilities
function upper(str) {
    return str ? String(str).toUpperCase() : "";
}

function lower(str) {
    return str ? String(str).toLowerCase() : "";
}