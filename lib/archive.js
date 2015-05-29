module.exports = function(opts, cb) {

    'use strict';

    console.log('Running archive script');

    var async = require('async'),
        Trello = require('node-trello'),
        trelloUtils = require('../lib/trelloUtils.js'),
        trello = new Trello(opts.apiKey, opts.token);

    var boardId = opts.boardUrl
                      .replace(/.*\/b\//, '')
                      .replace(/\/.*$/, '');

    var doArchive = function(cardId, cb) {
        async.waterfall([
            trelloUtils.addAttachmentToCard(trello, cardId, './charts.html', 'Burndown Chart.html', 'text/html'),
            trelloUtils.addAttachmentToCard(trello, cardId, './burndown.json', 'Burndown Data.json', 'application/json')
        ], function(err, result) {
            if(err) { return cb(err); }
            return cb(null);
        });
    };

    async.waterfall([
        trelloUtils.getBoardCardIdByName(trello, boardId, opts.archiveCard),
        doArchive
    ], function(err, result) {
        if(err) { return cb(err); }
        return cb(null);        
    });


};