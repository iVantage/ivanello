
module.exports = function(opts, cb) {
  'use strict';

  var fs = require('fs')
    , path = require('path');

  var saveLoc = process.cwd()
    , datafile = path.join(saveLoc, opts.datafile);

  var listsToSave = require('../lists.json');

  var stories;
  try {
    stories = listsToSave.reduce(function(prev, curr, ix, arr) {
      var listFileName = curr.toLowerCase().replace(/\s+/, '-') + '.json';
      return prev.concat(require(path.join(saveLoc, listFileName)));
    }, []);
  } catch(err) {
    return cb(err);
  }

  var numStories = stories.length
    , numStoryPoints = stories.reduce(function(prev, curr, ix, arr) {
        var title = curr.name.trim();
        if(/^\((\d+)\).*/.exec(title)) {
          var points = Number(RegExp.$1);
          if(!isNaN(points)) {
            return prev + points;
          }
        }
        return prev;
      }, 0)
    , numTasks = stories.reduce(function(prev, curr, ix, arr) {
        if(curr.taskData) {
          return prev + curr.taskData.length;
        }
        return prev;
      }, 0)
    , numTaskHours = stories.reduce(function(prev, curr, ix, arr) {
        if(curr.taskData) {
          return curr.taskData.reduce(function(tPrev, tCurr, tIx, tArr) {
            if(tCurr.state === 'incomplete') {
              var title = tCurr.name.trim();
              if(/^\((\d+)\).*/.exec(title)) {
                var hours = Number(RegExp.$1);
                if(!isNaN(hours)) {
                  return tPrev + hours;
                }
              }
              return tPrev;
            }
            return tPrev;
          }, prev);
        }
        return prev;
      }, 0);


  if(!fs.existsSync(datafile)) {
    fs.writeFileSync(datafile, JSON.stringify({
      storyPoints: [],
      storyCount: [],
      taskHours: [],
      taskCount: [],
      time: []
    }));
  }

  var data = JSON.parse(fs.readFileSync(datafile).toString());

  data.time = data.time || [];
  data.storyCount = data.storyCount || [];
  data.storyPoints = data.storyPoints || [];
  data.taskCount = data.taskCount || [];
  data.taskHours = data.taskHours || [];

  data.time.push(Date.now());
  data.storyCount.push(numStories);
  data.storyPoints.push(numStoryPoints);
  data.taskCount.push(numTasks);
  data.taskHours.push(numTaskHours);

  fs.writeFileSync(datafile, JSON.stringify(data), null, '  ');

  cb(null);
};
