const fs = require("fs");
const path = require("path");
const glob = require("glob");

module.exports = {
  listOas: function (globs) {
    if (!globs || !globs.length) {
      globs = [ '**/*.{yaml,yml,json}' ];
    }

    let out = [];
    globs.forEach(g => {
      // Concat them and filter dupes
      const list = filterOas(glob.sync(g));
      out = out.concat(list.filter((item) => out.indexOf(item) < 0));
    });
    return out;
  },
};

function filterOas(files) {
  const oas = files.filter((fn) => {
    if (fn.match(/.json$/)) {
      try {
        const j = require(path.join(process.cwd(), fn));
        if (j.openapi || j.swagger) {
          return true;
        }
      } catch (e) {}
    }
    if (fn.match(/.(yaml|yml)/)) {
      const j = fs.readFileSync(path.join(__dirname, fn), "utf8");
      const match = j.match(/\s?(openapi|swagger):\s([\s".0-9]+){3,}/);
      if (match) return true;
    }
    return false;
  });
  return oas;
}
