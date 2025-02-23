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