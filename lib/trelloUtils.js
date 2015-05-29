var format = require('util').format,
    path = require('path'),
    fs = require('fs');

module.exports = {

  /**
   * Returns the id of list name in the given board.
   * @param  {Trello} Trello object
   * @param  {string} Board id
   * @param  {string} List name
   * @param  {function} Callback
   */
  getBoardListIdByName: function(t, boardId, listName, cb) {
    return function(cb) {
      var listNameLowerCase = listName.toLowerCase();
      t.get(format('/1/boards/%s/lists', boardId), function(err, lists) {
        if(err) {return cb(err);}
        var ix;
        for(ix = lists.length; ix--;) {
          if(lists[ix].name.toLowerCase() === listNameLowerCase) {
            return cb(null, lists[ix].id);
          }
        }
        cb(new Error(format('Could not find a list %s in board %s.', listNameLowerCase, boardId)));
      });
    };
  },

  /**
   * Returns the id of list name in the given card.
   * @param  {Trello} Trello object
   * @param  {string} Board id
   * @param  {string} Card name
   * @param  {function} Callback
   */
  getBoardCardIdByName: function(t, boardId, cardName, cb) {
    return function(cb) {
      var cardNameLowerCase = cardName.toLowerCase();
      t.get(format('/1/boards/%s/cards', boardId), function(err, lists) {
        if(err) {return cb(err);}
        var ix;
        for(ix = lists.length; ix--;) {
          if(lists[ix].name.toLowerCase() === cardNameLowerCase) {
            return cb(null, lists[ix].id);
          }
        }
        cb(new Error(format('Could not find a list %s in board %s.', cardNameLowerCase, boardId)));
      });
    };
  },

  /**
   * Post an attachment to the given card.
   * 
   * @param  {Trello} Trello object
   * @param  {string} Card id
   * @param  {string} Path to file to attach
   * @param  {string} Name of attachment on card
   * @param  {string} Mime type of the file
   * @param  {function} Callback
   * @return {function}
   */
  addAttachmentToCard: function(t, cardId, filePath, attachmentName, mimeType, cb) {
    return function(cb) {
      fs.readFile(filePath, 'utf8', function(err, data) {
        if(err) { return cb(err); }
        t.post(format('/1/cards/%s/attachments', cardId), {file: data, name: attachmentName, mimeType: mimeType}, function(err, lists) {
          if(err) { return cb(err); }
          return cb(null);
        });  
      });      
    };
  },

  /**
   * Post an attachment to the given card.
   * 
   * @param  {Trello} Trello object
   * @param  {string} Card id
   * @param  {string} Path to file to attach
   * @param  {string} Name of attachment on card
   * @param  {string} Mime type of the file
   * @param  {function} Callback
   * @return {function}
   */
  deleteAttachmentsFromCard: function(t, cardId, attachmentId) {
    return function(cb) {
      t.del(format('/1/cards/%s/attachments/%s', cardId, attachmentId), function(err, lists) {
        if(err) { return cb(err); }
        return cb(null);
      });    
    };
  },
};
