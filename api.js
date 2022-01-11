const { PROJECT_NAME } = process.env

const api = require('express').Router();
const Glob = require('glob');
const path = require('path');

api.get('/', (req, res) => {
  res.json({
    msg: `Welcome to ${PROJECT_NAME}`,
  });
});

const apis = Glob.sync('*.router.js', { cwd: './routers' });

console.log(apis);

apis.map((t) => require(path.resolve(`./routers/${t}`))).forEach((subApi) => api.use(subApi));

module.exports = api;
