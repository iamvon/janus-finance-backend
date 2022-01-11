const Mongoose = require('mongoose');
const Glob = require('glob');

module.exports.connect = (mongoUri) => new Promise((resolve, reject) => {
  Mongoose.Promise = global.Promise;
  Mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then((b) => {
      // console.log(b);
    })
    .catch((err) => {
      console.log(err)
      if (err) throw err.message;
    });
  
  process.on('SIGINT', () => {
    Mongoose.connection.close(() => {
      console.log('Mongo Database disconnected through app termination');
      process.exit(0);
    });
  });
  Mongoose.connection.on('connected', () => {
    console.log('mongoose connected')
    resolve('Mongo Database connected');
  });
  Mongoose.connection.on('disconnected', () => {
    console.log('Mongo Database Disconnected');
    process.exit(0);
  });
  const models = Glob.sync('models/*.model.js');
  models.forEach((model) => {
    require(`./${model}`);
  });
});

module.exports.close = () => new Promise((resolve, reject) => {
  Mongoose.connection.close(() => {
    resolve();
  });
});
