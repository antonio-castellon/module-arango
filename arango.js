"use strict";
//
// ArangoDB connector manager.
//
// Castellon.CH (c)
// Author: Antonio Castellon - antonio@castellon.ch
//
// config parameter:
//
// module.exports = {
//      
//      ,CERTIFICATION_PATH : '/opt/brdb/Certificate'
//
//  	,ARANGO_URL: 'http://127.0.0.1:8529'
//  	,ARANGO_USER: 'root'
//  	,ARANGO_PASSWORD: 'root'
//  	,ARANGO_DATABASE: 'brdb' 
//  	,TRACES : true
// }
//

const arangojs = require('arangojs');
const fs = require('fs');

module.exports = function(setup) {

    const model = {};

    //
    // CONFIGURATION
    //
    const db = new arangojs.Database({
                                                url : setup.ARANGO_URL
                                                ,agentOptions: {
                                                                  ca: [
                                                                      fs.readFileSync(setup.CERTIFICATION_PATH + "/ca.pem")
                                                                  ]
                                                              }
                                            }
                                            );
    db.useBasicAuth(setup.ARANGO_USER, setup.ARANGO_PASSWORD);
    db.useDatabase(setup.ARANGO_DATABASE);

    db.listCollections().then(function (collections) {
        console.log("Your collections: " + collections.map(function (collection) {
            return collection.name;
        }).join(", "));
    });

    //
    // ASSIGNATIONS
    //

    model.find = find;
    model.findAQL = findAQL;
    model.findAQLSentence = findAQLSentence;
    model.save = save;
    model.remove = remove;


    //
    //  FUNCTION BODY
    //

    function find(parameters, collectionName){


        return new Promise(function(resolve, reject){

            try {

                if (setup.TRACES && !parameters._key) console.log(parameters);

                const collection = db.collection(collectionName);

                collection.byExample(parameters).then(
                    cursor => cursor.all()
                ).then(
                    docs => resolve(docs),
                    err => reject(err)
                );

            }catch(ex) {
                console.log(ex);
                reject(ex);
            }

        });
    }

    function findAQL(parameters, collectionName) {

        return new Promise(function(resolve, reject){

            try {

                let conditions = "";
                let aux = "";

                Object.keys(parameters).forEach(function(key) {
                    conditions = conditions + aux + 'i.' + key + '==\'' + parameters[key] + '\'';
                    aux = " || ";
                    conditions = conditions + aux + ' \'' +  parameters[key] + '\' IN i.' + key + '[*]' ;
                })

               if (conditions.length > 0) { conditions = ' FILTER ' + conditions; };

               // console.log(collectionName + ' >> ' + conditions);

                db.query('FOR i IN ' + collectionName + conditions + ' RETURN i')
                    .then(function (cursor) {return cursor.all();})
                    .then(
                        function (list) {/*console.log(list);*/ resolve(list);},
                        function (err) {reject(err);}
                     );

            }catch(ex) {
                console.log(ex);
                reject(ex);
            }

        });
    }

    /**
     * Only to be sued in complex queries.
     * @param sentence
     * @returns {Promise<any>}
     */
    function findAQLSentence(sentence) {

        return new Promise(function(resolve, reject){

            try {

                db.query(sentence)
                    .then(function (cursor) {return cursor.all();})
                    .then(
                        function (list) {
                            /*console.log(list);*/
                            resolve(list);
                        },
                        function (err) {reject(err);}
                    );

            }catch(ex) {
                console.log(ex);
                reject(ex);
            }

        });
    }


    function insert(document, collectionName)
    {
        return new Promise(function(resolve, reject){
            try {
                const collection = db.collection(collectionName);

                collection.save(document /*, {returnNew:true}*/).then(function(results){
                    // resolve(results.new);
                    resolve(results._result);
                });

            }catch(ex) {
                console.log(document);
                console.log(ex);
                reject(ex);
            }
        });
    }

    function update(document, collectionName)
    {
        return new Promise(function(resolve, reject){
            try {
                // console.log(collectionName);
                // console.log(document);

                const collection = db.collection(collectionName);

                collection.replace(document._id, document /*, {returnNew:true}*/).then(function(results){
                   // console.log(results)
                    resolve(results._result);
                    //resolve(results.new);
                });

            }catch(ex) {
                //  console.log(document);
                console.log(ex);
                reject(ex);
            }
        });
    }


    function remove(document, collectionName)
    {
        return new Promise(function(resolve, reject){
            try {
                // console.log(collectionName);
                // console.log(document);

                const collection = db.collection(collectionName);

                collection.remove(document).then(function(results){
                    resolve(results._result);
                });

            }catch(ex) {
                //  console.log(document);
                console.log(ex);
                reject(ex);
            }
        });
    }

    function save(document, collectionName){
        return new Promise(function(resolve, reject){

            try {
                //console.log(collectionName);
                //console.log(document);
                const collection = db.collection(collectionName);

                if (typeof document._key == 'undefined') {
                     insert(document, collectionName).then(function(r){ resolve(r)});
                 }
                 else {
                    collection.exists(document).then(function (results) {

                        if (results) {
                            update(document, collectionName).then(function (r) {
                                resolve(r)
                            });
                        }
                        else {
                            insert(document, collectionName).then(function (r) {
                                resolve(r)
                            });
                        }
                    })
                }

            }catch(ex) {
                // console.log(document);
                console.log(ex);
                reject(ex);
            }

        });

    }

    return model;

}


