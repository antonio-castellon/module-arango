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
