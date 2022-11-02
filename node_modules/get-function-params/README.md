# get-function-params [![npm version](https://badge.fury.io/js/get-function-params.svg)](https://badge.fury.io/js/get-function-params)

Get list of function params, including default values (if any).

### Installation

```bash
npm i get-function-params -S
```

### Usage

```js
const getParams = require('get-function-params')

// returns [{ param: 'a' }, { param: 'b' }, { param: 'c' }]
getParams(function(a, b, c) {})

// strips out inline comments
// returns [{ param: 'a' }, { param: 'b' }, { param: 'c' }]
getParams(function(a, b, /* bork */ c) {})

// supports arrow functions
// returns [{ param: 'a' }, { param: 'b' }, { param: 'c' }]
getParams((a, b, c) => {})

// supports default values
// returns [{ param: 'a' }, { param: 'b', default: true }]
getParams((a, b=true) => {})
```