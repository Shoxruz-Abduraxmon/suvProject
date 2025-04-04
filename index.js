const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const expHbs = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongo');

dotenv.config();

const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/register');
const homeRouter = require('./routes/home');
const clientRouter = require('./routes/clients');
const editZakazRouter = require('./routes/editZakaz');
const kuryerRouter = require('./routes/kuryer');

const bot = require('./bot/telegram');

const app = express();

const hbs = expHbs.create({
    extname: '.hbs'
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(loginRoutes);
app.use(registerRoutes);
app.use(homeRouter);
app.use(clientRouter);
app.use(editZakazRouter);
app.use(kuryerRouter);
    
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: process.env.mongoURI}),
    cookie: {
        maxAge: 1000*60*60*8
    }
}));

bot.launch().then(() => {
    console.log("Telegram bot ishga tushdi!");
}).catch((error) => {
    console.error("Botni ishga tushirishda xatolik:", error);
});


const connectDb = async() => {
    try{
        mongoose.set('strictQuery', false);

        await mongoose.connect(process.env.mongoURI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('mongoDb connect');

        app.listen(process.env.PORT, () => {
            console.log('open localhost ' + process.env.PORT);
        })
    }catch (e) {
        console.log('connectDb da munammo' + e);
    }
}

connectDb();