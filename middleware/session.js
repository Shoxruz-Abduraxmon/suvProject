const session = require('express-session');
const MongoStore = require('connect-mongo');

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.mongoURI,
        ttl: 60 * 60 * 8, // 8 soat (seconds)
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 8 // 8 soat (milliseconds)
    }
});

module.exports = sessionMiddleware;
