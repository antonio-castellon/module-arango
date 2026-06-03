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
- find, findAQL, findAQLSentence, save, remove

## License

MIT
