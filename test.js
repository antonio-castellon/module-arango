//
// test module
//
const config = require('./config-template.js');
const db = require('./arango.js')(config);

const _COLLECTION = 'lots';
 
db.find({},_COLLECTION )
        .then((docs) => { console.log('succes execution ' + docs.length)})
        .catch((e) => { console.log('ERROR ')})