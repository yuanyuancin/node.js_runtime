'use strict';

let out = '';

function log(...args) {
  out += args.join(' ') + '\n';
  console.log(...args);
}

function clearOut() {
  out = '';
}

module.exports = {
  log,
  clearOut,
  get out() {
    return out;
  },
};
