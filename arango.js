"use strict";
//
// ArangoDB connector manager.
//
// Castellon.CH (c)
// Author: Antonio Castellon - antonio@castellon.ch
//

const arangojs = require('arangojs');
const fs = require('fs');

/**
 * ArangoDB helper factory.
 *
 * Creates a lightweight persistence interface over arangojs.
 * Supports basic find-by-example, simple AQL generation, raw AQL,
 * and upsert-style save (insert or replace by _key).
 *
 * Side effect on creation: connects to the DB and logs available collections.
 *
 * @param {object} setup
 * @param {string} setup.ARANGO_URL - e.g. 'http://127.0.0.1:8529'
 * @param {string} setup.ARANGO_USER
 * @param {string} setup.ARANGO_PASSWORD
 * @param {string} setup.ARANGO_DATABASE
 * @param {string} [setup.CERTIFICATION_PATH] - path containing ca.pem for TLS
 * @param {boolean} [setup.TRACES]
 * @returns {{find: Function, findAQL: Function, findAQLSentence: Function, save: Function, remove: Function}}
 */
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

  /**
   * Find documents by example (uses collection.byExample).
   *
   * @param {object} parameters - example document (key/value match)
   * @param {string} collectionName
   * @returns {Promise<Array>} array of matching documents
   */
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

  /**
   * Simple AQL query builder from parameters.
   * Generates a FILTER clause that does equality OR array membership (IN) for each field.
   *
   * @param {object} parameters
   * @param {string} collectionName
   * @returns {Promise<Array>} matching documents
   */
  function findAQL(parameters, collectionName) {
    return new Promise((resolve, reject) => {
      try {
        let conditions = '';
        let aux = '';
        Object.keys(parameters).forEach(function(key) {
          conditions = conditions + aux + 'i.' + key + '==\'' + parameters[key] + '\'';
          aux = ' || ';
          conditions = conditions + aux + ' \'' +  parameters[key] + '\' IN i.' + key + '[*]' ;
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

  /**
   * Execute a raw AQL query string.
   *
   * @param {string} sentence - full AQL statement (e.g. 'FOR p IN products RETURN p')
   * @returns {Promise<Array>} result list
   */
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

  /**
   * Save (insert or replace by _key).
   * If document has no _key -> insert.
   * If _key exists and document exists -> replace.
   * Otherwise -> insert.
   *
   * Internally delegates to (non-exported) insert/update helpers.
   *
   * @param {object} document - document to save (may contain _key or _id)
   * @param {string} collectionName
   * @param {boolean} [returnNew=false] - if true, returns the new/updated document instead of metadata
   * @returns {Promise<object>} saved result (metadata or the document when returnNew)
   */
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

  /**
   * Internal: insert a new document.
   * @private
   * @param {object} document
   * @param {string} collectionName
   * @param {boolean} [returnNew=false]
   * @returns {Promise<object>}
   */
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

  /**
   * Internal: replace an existing document by _id.
   * @private
   * @param {object} document - must contain _id
   * @param {string} collectionName
   * @param {boolean} [returnNew=false]
   * @returns {Promise<object>}
   */
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

  /**
   * Remove a document.
   *
   * @param {object} document - identifier object (usually contains _key or _id)
   * @param {string} collectionName
   * @returns {Promise<object>} removal result metadata
   */
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