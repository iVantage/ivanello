
module.exports = function(opts, cb) {
  'use strict';

  var fs = require('fs')
    , path = require('path')
    , hbs = require('handlebars');

  var saveLoc = process.cwd()
    , datafile = path.join(saveLoc, opts.datafile);

  hbs.registerHelper('join', function(arr) {
    return arr.join(',');
  });

  var tplStr = fs.readFileSync(__dirname + '/../site-tpl/index.hbs').toString()
    , tpl = hbs.compile(tplStr);

  var view = JSON.parse(fs.readFileSync(datafile));

  view.sprintName = 'Sprint XYZ';

  fs.writeFileSync(opts.outfile, tpl(view));

  cb(null);
};
