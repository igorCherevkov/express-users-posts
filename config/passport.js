const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { User } = require('../models/models');

module.exports = function(passport) {
    passport.use(new LocalStrategy(
        async function(username, password, done) {
            try {
                const user = await User.findOne({ where: { username } });
                if (!user) {
                    return done(null, false, { message: 'Неправильное имя пользователя или пароль.' });
                }
                
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    return done(null, false, { message: 'Неправильное имя пользователя или пароль.' });
                }
                
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    ));
    
    passport.serializeUser(function(user, done) {
        done(null, user.username);
    });
      
    passport.deserializeUser(async function(username, done) {
        try {
            const user = await User.findOne({ where: { username } });
            if (user) {
                done(null, user);
            } else {
                done(new Error('User not found'), null);
            }
        } catch (err) {
            done(err);
        }
    });
}