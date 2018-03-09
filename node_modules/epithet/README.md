# epithet

Very simple random name generator.

Compatible with [`browserify`](https://www.npmjs.com/package/browserify).

## Installation

```sh
$ npm install epithet
```
Install with the `--save` (or `-S`) flag to add `epithet` to your package’s dependencies.

Install with the `--save-dev` (or `-D`) flag to add `epithet` as a development dependency, for example if you are only bundling it for client-side use with `browserify`.

## Usage

```js
var epithet = require('epithet');

firstTitle = epithet.choose(); // firstTitle = 'brilliant-friend';
secondTitle = epithet.choose('.'); // secondTitle = 'new.name';
```

## Methods

### `.choose(opt)`

`epithet.choose()` returns a **string** combining an adjective and a noun joined by a separator, e.g. `lost-child`.

An optional argument specifies the separator between the adjective and the noun. If no argument is provided, the default hyphen is used.

### `.randomWord(opt)`

Returns a random **string**.

An optional argument specifies the word type and can be one of `adjective` or `noun`. If no argument is provided, a type of `noun` is assumed.

### `.returnDict(opt)`

Returns an **array** of all the words of a certain type in epithet’s dictionary.

An optional argument specifies the word type and can be one of `adjective` or `noun`. If no argument is provided, a type of `noun` is assumed.

## Acknowledgements

Based on [moniker](https://github.com/weaver/moniker/)’s dictionaries.
