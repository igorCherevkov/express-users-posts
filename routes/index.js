const express = require('express');
const router = express.Router();
const userRoutes = require('./user');
const postsRoutes = require('./posts');

router.use('/', userRoutes);
router.use('/', postsRoutes);

module.exports = router;