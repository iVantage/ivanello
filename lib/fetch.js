/*jshint regexp:false */

// All mostly stolen from stellojs/stello

module.exports = function(opts, cb) {
  'use strict';

  var format = require('util').format
    , fs = require('fs')
    , path = require('path');

  var request = require('request')
    , async = require('async')
    , _after = require('lodash.after');

  var apiKey = opts.apiKey
    , authToken = opts.token
    , boardId = opts.boardUrl
      .replace(/.*\/b\//, '')
      .replace(/\/.*$/, '');

  var saveLoc = process.cwd();

  var listsToSave = require('../lists.json');

  var done = _after(listsToSave.length, cb || function() {});

  var getBoardListIdByName = function(boardId, listName) {
    var listNameLowerCase = listName.toLowerCase();
    return function(cb) {
      var uri = format('https://api.trello.com/1/boards/%s/lists?key=%s&token=%s', boardId, apiKey, authToken);
      request(uri, function(error, resp, body) {
        if(error) { return cb(error); }
        var lists, ix;
        try {
          lists = JSON.parse(body);
        } catch(error) {
          return cb(error);
        }
        for(ix = lists.length; ix--;) {
          if(lists[ix].name.toLowerCase() === listNameLowerCase) {
            return cb(null, lists[ix].id);
          }
        }
        cb(new Error(format('Could not find a list %s in board %s.', listName, boardId)));
      });
    };
  };

  var getListCards = function(listId, cb) {
    var uri = format('https://api.trello.com/1/lists/%s/cards?key=%s&token=%s', listId, apiKey, authToken);
    request(uri, function(error, resp, body) {
      if(error) { return cb(error); }
      var cards;
      try {
        cards = JSON.parse(body);
      } catch(error) {
        return cb(error);
      }
      return cb(null, cards);
    });
  };

  var saveAs = function(filename) {
    return function(data, cb) {
      var filepath = path.join(saveLoc, filename);
      fs.writeFile(filepath, JSON.stringify(data), function(error) {
        return error ? cb(error) : cb();
      });
    };
  };

  listsToSave.forEach(function(listName) {
    var listFileName = listName.toLowerCase().replace(/\s+/, '-') + '.json';

    async.waterfall([
      getBoardListIdByName(boardId, listName),
      getListCards,
      saveAs(listFileName)
    ], function(err) {
      return err ? cb(err) : done();
    });
  });
};

