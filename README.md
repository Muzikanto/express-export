<h1 align="center">Express Export</h1>

<div align="center">

[![npm version](https://badge.fury.io/js/express-export.svg)](https://badge.fury.io/js/express-export)
[![downloads](https://img.shields.io/npm/dm/express-export.svg)](https://www.npmjs.com/package/express-export)
[![size](https://img.shields.io/bundlephobia/minzip/express-export)](https://bundlephobia.com/result?p=express-export)
[![Coverage Status](https://img.shields.io/codecov/c/github/muzikanto/express-export/master.svg)](https://codecov.io/gh/muzikanto/express-export/branch/master)
[![dependencies Status](https://david-dm.org/express-export/status.svg)](https://david-dm.org/express-export)
[![type](https://badgen.net/npm/types/express-export)](https://badgen.net/npm/types/express-export)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/muzikanto/express-export/blob/master/LICENSE)
![Code style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)

</div>

<!-- TOC -->

- [Installation](#installation)
- [Example](#example)
- [License](#license)

<!-- /TOC -->

## Installation

```sh
npm i express-export
# or
yarn add express-export
```

## Example

### Root file

```typescript jsx
const server = express();

ExportFile.applyMiddleware(server);
```

### Add router

```typescript jsx
const data = [
  { user: "Maxim", age: 22, location: "Moscow" },
  { user: "Valentina", age: 18 }
];
const fields = ["user", "age"];

server.get("/", function(req, res, next) {
  res.export({
    format: req.query.format as ExportFormat, // csv | xml | json
    filename: "users",
    data,
    fields,
    download: false
  });
});
```

## License

[MIT](LICENSE)
