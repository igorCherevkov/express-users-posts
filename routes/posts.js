const express = require('express');
const router = express.Router();
const { User, Post } = require('../models/models');
const { isAuthenticated  } = require('../middleware/isAuth');

router.post('/create-post', isAuthenticated, async (req, res) => {
    try {
        const { title, content } = req.body;
        const user = req.user;

        await Post.create({
            title,
            content,
            userId: user.username
        })

        res.redirect('/profile');
    } catch (e) {
        res.status(500).send('Ошибка создания поста');
    }
});

router.get('/profile/edit-post/:id', isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findOne({
            where: {
                id: req.params.id,
                userId: req.user.username
            }
        })

        if (!post) {
            return res.status(404).send('Пост не найден');
        }

        res.render('edit-post', { post });
    } catch (e) {
        res.status(500).send('Внутренняя ошибка');
    }
});

router.post('/profile/edit-post/:id', isAuthenticated, async (req, res) => {
    try {
        const { title, content } = req.body;
        const post = await Post.findOne({
            where: {
                id: req.params.id,
                userId: req.user.username
            }
        })

        if (!post) {
            return res.status(404).send('Пост не найден');
        }

        post.title = title;
        post.content = content;

        await post.save();

        res.redirect('/profile');
    } catch (e) {
        res.status(500).send('Ошибка при создании поста');
    }
});

module.exports = router;