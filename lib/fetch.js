/*jshint regexp:false */

// All mostly stolen from stellojs/stello

module.exports = function(opts, cb) {
  'use strict';

  var format = require('util').format
    , fs = require('fs')
    , path = require('path');

  var request = require('request')
    , async = require('async')
    , _clone = require('lodash.clone')
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
      var cards, taskCards, taskCard, checklistItems, clCount;
      try {
        cards = JSON.parse(body);

        // Get a count of how many checklists we will need to process
        clCount = cards.reduce(function(prev, curr, ix, array) {
          return curr.idChecklists ? prev + curr.idChecklists.length : prev;
        }, 0);

        if(clCount === 0) {
          return cb(null, cards);
        } else {

          taskCards  = [];

          var checkDone = _after(clCount, function() {
            return cb(null, taskCards);
          });

          // For each card, attempt to get the checklists.
          cards.forEach(function(card, ix, array) {
            if(card.idChecklists && card.idChecklists.length > 0) {
              // For each checklist, retrieve additional details about the
              // individual check items.
              card.idChecklists.forEach(function(checklistId) {
                getChecklistItems(checklistId, function(error, taskData) {
                  if(taskData && taskData.length > 0) {
                    if(error) { return cb(error); }
                    taskCard = _clone(card);
                    taskCard.taskData = taskData;
                    taskCards.push(taskCard);
                  }
                  return checkDone();
                });
              });
            }
          });

        }

      } catch(error) {
        console.log("Error!");
        return cb(error);
      }
    });
  };

  /**
   * Retrieve all checklist items for any "Tasks" lists
   */
  var getChecklistItems = function(checklistId, cb) {
    var checklistUri = format('https://api.trello.com/1/checklists/%s/?key=%s&token=%s', checklistId, apiKey, authToken);
    request(checklistUri, function(error, resp, clBody) {
      if(error) {
        return cb(error);
      } try {
        var checklistInfo = JSON.parse(clBody);
        // If the name is "tasks", then this is a Tasks checklist.
        if(checklistInfo.name && checklistInfo.name.toLowerCase() === 'tasks') {
          // Okay, we now need to get the checklist item states.
          if(checklistInfo.checkItems && checklistInfo.checkItems.length > 0) {
            return cb(null, checklistInfo.checkItems);
          }
        }
        return cb(null, []);
      } catch(error) {
        return cb(error);
      }
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

