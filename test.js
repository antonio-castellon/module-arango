//
// Extended example tests for arango
//
const config = require('./config.arango.template.js');
const db = require('./arango.js')(config);

// db.find({status: 'active'}, 'mycoll').then(r => console.log(r.length));
console.log('arango - implement real collection tests. find/findAQL/save/remove exposed.');
