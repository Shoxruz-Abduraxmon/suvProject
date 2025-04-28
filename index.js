const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const expHbs = require('express-handlebars');

dotenv.config();

const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/register');
const homeRouter = require('./routes/home');
const clientRouter = require('./routes/clients');
const editZakazRouter = require('./routes/editZakaz');
const kuryerRouter = require('./routes/kuryer');
const sessionMiddleware = require('./middleware/session'); 

const bot = require('./bot/telegram');

const app = express();

// Handlebars config
const hbs = expHbs.create({
    extname: '.hbs'
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMiddleware);

// Routes
app.use(loginRoutes);
app.use(registerRoutes);
app.use(homeRouter);
app.use(clientRouter);
app.use(editZakazRouter);
app.use(kuryerRouter);

// Bot launch
// bot.launch().then(() => {
//     console.log("Telegram bot ishga tushdi!");
// }).catch((error) => {
//     console.error("Botni ishga tushirishda xatolik:", error);
// });

// // DB connect
// const connectDb = async () => {
//     try {
//         mongoose.set('strictQuery', false);
//         await mongoose.connect(process.env.mongoURI, {
//             serverSelectionTimeoutMS: 5000
//         });
//         console.log('MongoDB connected');

//         app.listen(process.env.PORT, () => {
//             console.log('Server open localhost:' + process.env.PORT);
//         });
//     } catch (e) {
//         console.log('connectDb da muammo: ' + e);
//     }
// }

// connectDb();

const start = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.mongoURI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('MongoDB connected');

        await bot.launch(); 
        console.log('Telegram bot ishga tushdi!');

        app.listen(process.env.PORT, () => {
            console.log('Server open localhost:' + process.env.PORT);
        });

    } catch (e) {
        console.error('connectDb da muammo:', e);
    }
};

start();  