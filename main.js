
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const  db = require('./database');
const morgan = require('morgan');

const {
    MONGODB_USER, 
    MONGODB_PASS, 
    MONGODB_IP, 
    MONGODB_PORT, 
    MONGODB_DATABASE, 
    PORT, 
    PROJECT_NAME,
    API_PREFIX
} = process.env

const urlConnection = `mongodb://${MONGODB_USER}:${MONGODB_PASS}@${MONGODB_IP}:${MONGODB_PORT}/${MONGODB_DATABASE}`;

console.log(urlConnection)

const app = express();
const server = require('http').Server(app);

const dbConnect = () => {
    db
        .connect(urlConnection)
        .then((msg) => {
            console.log(msg);
            console.log('MongoDB Url: ', MONGODB_IP);
        }).catch((err) => {
            console.log({error: err.message});
            console.log('ERROR DATABASE', err);
            throw err;
        })
}

const initApi = () => {
    app.use(morgan('dev'));
    app.use(cors());
    app.options('*', cors());
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(API_PREFIX, require('./api'));
    app.use((err, req, res, next) => {
        res.json({error: errMes.e ?? 'Error !!!'});
    });
    console.log('Bootstrap ending time', new Date());
}

module.exports = () => {
    return Promise.all([dbConnect(), initApi()])
        .then(() => {
            server.listen(PORT, (err) => {
                if (err) throw err;
                console.log(`${PROJECT_NAME} server is listening on port ${PORT}`);
                console.log(new Date());
            });
        }).catch(err => {
            console.log('Something wrong!', err);
        });
}

module.exports.server = server;