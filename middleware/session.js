const session = require('express-session');
const MongoStore = require('connect-mongo');

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.mongoURI,
        ttl: 60 * 60 * 8 
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 8 
    }
});

module.exports = sessionMiddleware;
