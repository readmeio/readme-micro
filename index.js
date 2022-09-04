/* We'll make this better eventually, but for now we'll make it quickly! */

const fs = require("fs");
const path = require("path");

const github = require('@actions/github');

require("dotenv").config({ path: path.join(__dirname, ".env") });

const axios = require("axios");

(() => {
  const commandLineArgs = require("command-line-args");
  const options = commandLineArgs([
    { name: "src", type: String, multiple: true, defaultOption: true },
    { name: "key", alias: "k", type: String },
    /*
  { name: 'src', type: String, multiple: true, defaultOption: true },
  { name: 'timeout', alias: 't', type: Number }
  */
  ]);

  // We're ignoring src for now, and using our own!

  const src = ["swagger.json", "swagger.yaml"];

  const specs = {};
  let spec;

  console.log(github);

  src.forEach((fileName) => {
    const file = path.join(process.cwd(), fileName);
    if (fs.existsSync(file)) {
      const oas = fs.readFileSync(file, "utf8");
      //specs[fileName] = {
      spec = {
        // just support one for now
        fileName,
        oas,

        // https://docs.github.com/en/actions/learn-github-actions/environment-variables
        branch: process.env.GITHUB_REF_NAME,
        hash: process.env.GITHUB_SHA,
      };
    }
  });

  //console.log(spec);

  //console.log(options, src);

  //console.log(process.env);
  const base = process.env.BASE_URL || "https://micro.readme.build";

  axios
    .post(`${base}/api/uploadSpec`, spec, {
      headers: { "X-API-KEY": options.key },
    })
    .then((response) => {
      console.log(response.data.url);
      console.log(response.data.explanation);
    })
    .catch((error) => {
      console.log(error);
    });
})();
