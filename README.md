# @acastellon/arango

ArangoDB persistence interface.

## Install

```bash
npm install @acastellon/arango
```

## Config example

See config.arango.template.js .

```js
module.exports = {
  CERTIFICATION_PATH: '/opt/brdb/Certificate',
  ARANGO_URL: 'http://127.0.0.1:8529',
  ARANGO_USER: 'root',
  ARANGO_PASSWORD: 'root',
  ARANGO_DATABASE: 'brdb',
  TRACES: true
};
```

## Usage

```js
const config = require('./config.arango.template.js');
const arango = require('@acastellon/arango')(config);

arango.find({foo: 'bar'}, 'mycollection').then(console.log);
```

## API

### find(parameters, collectionName): Promise<docs[]>

byExample query.

**Example (with minimal setup):**

```js
const config = require('./config.arango.template.js');
const db = require('@acastellon/arango')(config);

const params = { status: 'active' };

db.find(params, 'mycollection')
  .then(docs => console.log(docs))
  .catch(err => console.error(err));
```

### findAQL(parameters, collectionName): Promise<docs[]>

Builds simple FILTER from parameters (supports IN for arrays).

**Example (with minimal setup):**

```js
const config = require('./config.arango.template.js');
const db = require('@acastellon/arango')(config);

const params = { type: 'fruit' };

db.findAQL(params, 'products')
  .then(results => console.log(results))
  .catch(err => console.error(err));
```

### findAQLSentence(sentence): Promise

Raw AQL.

**Example (with minimal setup):**

```js
const config = require('./config.arango.template.js');
const db = require('@acastellon/arango')(config);

const aql = 'FOR p IN products FILTER p.price > 10 RETURN p';

db.findAQLSentence(aql)
  .then(results => console.log(results))
  .catch(err => console.error(err));
```

### save(document, collectionName, [returnNew=false]): Promise

Insert or replace (by _key). Internally uses exists + insert/update helpers (not exported on model).

**Example (with minimal setup):**

```js
const config = require('./config.arango.template.js');
const db = require('@acastellon/arango')(config);

const doc = { _key: 'prod123', name: 'Apple', price: 1.5 };

db.save(doc, 'products', true)
  .then(result => console.log('Saved:', result))
  .catch(err => console.error(err));
```

### remove(document, collectionName): Promise

**Example (with minimal setup):**

```js
const config = require('./config.arango.template.js');
const db = require('@acastellon/arango')(config);

const doc = { _key: 'prod123' };

db.remove(doc, 'products')
  .then(result => console.log('Removed:', result))
  .catch(err => console.error(err));
```

## License

MIT

## Notice and Disclaimer

NOTICE AND DISCLAIMER: This software automatically retrieves, accesses or interacts with external materials. Those retrieved materials are not distributed with this software and are governed solely by separate terms, conditions and licenses. You are solely responsible for finding, reviewing and complying with all applicable terms, conditions, and licenses, and for verifying the security, integrity and suitability of any retrieved materials for your specific use case. This software is provided "AS IS", without warranty of any kind. The author makes no representations or warranties regarding any retrieved materials, and assumes no liability for any losses, damages, liabilities or legal consequences from your use or inability to use this software or any retrieved materials. Use this software and the retrieved materials at your own risk.

External materials module-arango interacts with at run time:

- Your ArangoDB database, under your agreements for that system.
