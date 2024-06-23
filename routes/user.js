const express = require('express');
const router = express.Router();
const { User, Post } = require('../models/models');
const { isAuthenticated  } = require('../middleware/isAuth');
const passport = require('passport');

router.get('/', async (req, res) => {
    try {
        const sortBy = req.query.sortBy || 'createdAt';
        const order = req.query.order || 'ASC';

        const users = await User.findAll({
            include: [{ model: Post, as: 'posts', order: [['createdAt', 'ASC']] }],
            order: [[sortBy, order]]
        });

        const isAuth = req.isAuthenticated();
        res.render('app', { users, isAuth, sortBy, order });
    } catch (e) {
        res.send(e);
    }
});

router.get('/register', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.render('register');
    }
});

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (password.length < 4) {
            return res.status(400).send('Пароль должен содержать минимум 4 символа.');
        }

        const user = await User.findOne({ where: { username } });
        if (user) {
            return res.status(400).send('Пользователь с таким именем уже существует.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            username,
            password: hashedPassword
        });
        res.redirect('/login');
    } catch (e) {
        res.send(e);
    }
});

router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.render('login');
    }
});

router.post('/login', 
    passport.authenticate('local', { 
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })
);

router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) {
            console.error('Ошибка logout:', err);
            return next(err);
        }
        res.redirect('/');
    });
});

router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        if (!req.user) {
            console.error('Пользователь не найден');
            return res.status(500).send('Пользователь не найден');
        }
        const user = req.user;

        const sortBy = req.query.sortBy || 'createdAt';
        const order = req.query.order || 'ASC';

        const posts = await Post.findAll({ 
            where: { userId: user.username },
            order: [[sortBy, order]]
        });

        res.render('profile', { user, posts, sortBy, order });
    } catch (e) {
        res.status(404).send('Ошибка при загрузке профиля пользователя.');
    }
});

module.exports = router;