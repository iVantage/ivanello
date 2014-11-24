
module.exports = function(opts, cb) {
  'use strict';

  var fs = require('fs');

  var saveLoc = process.cwd();

  var listsToSave = require('../lists.json');

  var tpl = fs.readFileSync('../site-tpl/index.html').toString();


};
