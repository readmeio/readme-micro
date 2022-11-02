var stringPatterns = require('./patterns').stringPatterns
var delim = require('./delim')

module.exports = function (cache, string) {
  while (true) {
    var shortestString = stringPatterns
      .reduce(function (arr, pattern) {
        return arr.concat(string.match(pattern) || [])
      }, [])
      .sort(function (a, b) { return a.length - b.length })
      [0]

    if (!shortestString) return string
    string = string.replace(shortestString, delim(cache.push(shortestString)))
  }
}