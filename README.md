# @acastellon/arango

ArangoDB persistence interface.

## Install

```bash
npm install @acastellon/arango
```

## Config example

See config.arango.template.js .

## Usage

```js
const config = require('./config.arango.template.js');
const arango = require('@acastellon/arango')(config);

arango.find({foo: 'bar'}, 'mycollection').then(console.log);
arango.save(doc, 'mycollection').then(...);
```

## API

### find(parameters, collectionName): Promise<docs[]>
byExample query.

### findAQL(parameters, collectionName): Promise<docs[]>
Builds simple FILTER from parameters (supports IN for arrays).

### findAQLSentence(sentence): Promise
Raw AQL.

### save(document, collectionName, [returnNew=false]): Promise
Insert or replace (by _key). Internally uses exists + insert/update helpers (not exported on model).

### remove(document, collectionName): Promise

## License

MIT
