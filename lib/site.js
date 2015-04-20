
module.exports = function(opts, cb) {
  'use strict';

  var fs = require('fs')
    , path = require('path')
    , hbs = require('handlebars');

  var saveLoc = process.cwd()
    , datafile = path.join(saveLoc, opts.datafile);

  var outfile = opts.outfile;

  hbs.registerHelper('join', function(arr) {
    return arr.join(',');
  });

  // Check if the array we're charting has any valid values.
  hbs.registerHelper('available', function(arr, options) {
    if(arr.reduce(function(prev, curr, ix, array) {
      return prev + curr;
      }) !== 0) {
      return options.fn(this);
    } else {
      return '';
    }
  });

  var tplStr = fs.readFileSync(__dirname + '/../site-tpl/index.hbs').toString()
    , tpl = hbs.compile(tplStr);

  var view = JSON.parse(fs.readFileSync(datafile));
  view.sprintName = opts.sprintName;
  view.endDate = opts.endDate;
  view.boardUrl = opts.boardUrl;

  fs.writeFileSync(outfile, tpl(view));

  cb(null);
};
