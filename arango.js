"use strict";
//
// ArangoDB connector manager.
//
// Castellon.CH (c)
// Author: Antonio Castellon - antonio@castellon.ch
//

const arangojs = require('arangojs');
const fs = require('fs');

module.exports = function(setup) {

  const model = {};
  let _agentOptions = {};

  if (setup.CERTIFICATION_PATH) {
    _agentOptions.ca = [ fs.readFileSync(setup.CERTIFICATION_PATH + '/ca.pem') ];
  }

  const db = new arangojs.Database({ url : setup.ARANGO_URL , agentOptions: _agentOptions });
  db.useBasicAuth(setup.ARANGO_USER, setup.ARANGO_PASSWORD);
  db.useDatabase(setup.ARANGO_DATABASE);

  db.listCollections().then(function (collections) {
    console.log('Your collections: ' + collections.map(c => c.name).join(', '));
  });

  model.find = find;
  model.findAQL = findAQL;
  model.findAQLSentence = findAQLSentence;
  model.save = save;
  model.remove = remove;

  function find(parameters, collectionName){
    return new Promise((resolve, reject) => {
      try {
        if (setup.TRACES && !parameters._key) console.log(parameters);
        const collection = db.collection(collectionName);
        collection.byExample(parameters).then( cursor => cursor.all() ).then( docs => resolve(docs), err => reject(err) );
      } catch(ex) {
        console.log(ex);
        reject(ex);
      }
    });
  }

  function findAQL(parameters, collectionName) {
    return new Promise((resolve, reject) => {
      try {
        let conditions = '';
        let aux = '';
        Object.keys(parameters).forEach(function(key) {
          conditions = conditions + aux + 'i.' + key + '==\'' + parameters[key] + '\'';
          aux = ' || ';
          conditions = conditions + aux + ' \'' + parameters[key] + '\' IN i.' + key + '[*]' ;
        });
        if (conditions.length > 0) { conditions = ' FILTER ' + conditions; }
        db.query('FOR i IN ' + collectionName + conditions + ' RETURN i')
          .then(cursor => cursor.all())
          .then(list => resolve(list), err => reject(err));
      } catch(ex) {
        console.log(ex);
        reject(ex);
      }
    });
  }

  function findAQLSentence(sentence) {
    return new Promise((resolve, reject) => {
      try {
        db.query(sentence).then(cursor => cursor.all()).then(list => resolve(list), err => reject(err));
      } catch(ex) {
        console.log(ex);
        reject(ex);
      }
    });
  }

  function save(document, collectionName, returnNew = false){
    return new Promise((resolve, reject) => {
      try {
        const collection = db.collection(collectionName);
        if (typeof document._key == 'undefined') {
          insert(document, collectionName, returnNew).then(r => resolve(r));
        } else {
          collection.exists(document).then(function (results) {
            if (results) {
              update(document, collectionName, returnNew).then(r => resolve(r));
            } else {
              insert(document, collectionName, returnNew).then(r => resolve(r));
            }
          });
        }
      } catch(ex) {
        console.log(ex);
        reject(ex);
      }
    });
  }

  function insert(document, collectionName, returnNew = false) {
    return new Promise((resolve, reject) => {
      try {
        const collection = db.collection(collectionName);
        collection.save(document , {returnNew: returnNew}).then(function(results){
          resolve( returnNew ? results.new : results );
        });
      } catch(ex) {
        console.log(ex);
        reject(ex);
      }
    });
  }

  function update(document, collectionName, returnNew=false) {
    return new Promise((resolve, reject) => {
      try {
        const collection = db.collection(collectionName);
        collection.replace(document._id, document , {returnNew: returnNew}).then(function(results){
          resolve( returnNew ? results.new : results );
        });
      } catch(ex) {
        console.log(ex);
        reject(ex);
      }
    });
  }

  function remove(document, collectionName) {
    return new Promise((resolve, reject) => {
      try {
        const collection = db.collection(collectionName);
        collection.remove(document).then(results => resolve(results));
      } catch(ex) {
        console.log(ex);
        reject(ex);
      }
    });
  }

  return model;
};
