# arango

A Simplified interface to arango database using the arangojs library
At the moment is accessing only to JSON Documents, not graph.

configuration as for example: 'config.arango.js' 

    module.exports = {
    
      CERTIFICATION_PATH : '/opt/brdb/Certificate' 
            /* note: the certification requires a 'ca.pem' file */
            /* @TODO: externalize it, and make it more flexible */
            
      ,ARANGO_URL: 'http://127.0.0.1:8529'
      ,ARANGO_USER: 'root'
      ,ARANGO_PASSWORD: 'root'
      ,ARANGO_DATABASE: 'test'   
      ,TRACES : false
    }

usage:

    const config = require('./config.arango.js');
    const db     = require('@acastellon/arango')(config);


find object(s) that contains all the parameters described in a collection

    find(parameters, collection)    
    
find object(s) that contains ANY parameter described in a collection
     
    findAQL(parameters, collection)
    
find object(s) using directly the AQL language from ArangoDB
    
    findAQLSentence(query)
    
save a document object into a collection
        
    save(document, collection)
    
delete a document object from a collection
    
    remove(document, collection)
