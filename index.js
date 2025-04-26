const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const expHbs = require('express-handlebars');

dotenv.config();

// Routerlar
const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/register');
const homeRouter = require('./routes/home');
const clientRouter = require('./routes/clients');
const editZakazRouter = require('./routes/editZakaz');
const kuryerRouter = require('./routes/kuryer');

// Middlewarelar
const sessionMiddleware = require('./middleware/session');

// Bot
const bot = require('./bot/telegram');

const app = express();

// Handlebars sozlamasi
const hbs = expHbs.create({
    extname: '.hbs'
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(sessionMiddleware); // << Session eng boshida bo'lishi kerak
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routerlar
app.use(loginRoutes);
app.use(registerRoutes);
app.use(homeRouter);
app.use(clientRouter);
app.use(editZakazRouter);
app.use(kuryerRouter);

// Botni ishga tushurish
bot.launch()
    .then(() => console.log("Telegram bot ishga tushdi!"))
    .catch((error) => console.error("Botni ishga tushirishda xatolik:", error));

// MongoDB bilan ulanish
const connectDb = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.mongoURI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('MongoDB connect');

        app.listen(process.env.PORT, () => {
            console.log('Open localhost:' + process.env.PORT);
        });
    } catch (e) {
        console.log('connectDb da muammo: ' + e);
    }
}

connectDb();
