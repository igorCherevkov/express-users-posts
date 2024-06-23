const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const { User } = require('./models/models');
const sequelize = require('./db/db');
const flash = require('connect-flash');
const router = require('./routes/index');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: '12345',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true 
    }
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport, User);

app.use('/', router)

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        app.listen(5000, () => console.log(`Server was started on port 5000`));
    } catch(e) {
        console.error('Ошибка при запуске сервера:', e);
    }
};

start();