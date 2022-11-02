var delim = require('./delim')

module.exports = function (cache, string, patterns) {
  patterns.forEach(function (pattern) {
    while (pattern.test(string)) {
      var match = pattern.exec(string)[0]
      string = string.replace(match, delim(cache.push(match)))
    }
  })
  return string
}
