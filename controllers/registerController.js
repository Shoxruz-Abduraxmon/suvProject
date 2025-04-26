const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.getRegister = (req, res) => {
    res.render('register', { title: "Register" });
};

exports.postRegister = async (req, res) => {
    try {
        const { name, email, password, password2 } = req.body;

        if (!name || !email || !password || !password2) {
            return res.status(400).send('Barcha qatorlarni to‘ldiring');
        }

        if (password.length < 5) {
            return res.status(400).send('Parol kamida 5 ta belgidan iborat bo‘lishi kerak');
        }

        if (password !== password2) {
            return res.status(400).send('Parollar mos emas');
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Bu email allaqachon ro‘yxatdan o‘tgan');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        console.log(`Yangi foydalanuvchi: ${name} - ${email}`);
        res.redirect('/login');
        
    } catch (error) {
        console.error('postRegister xatosi:', error);
        res.status(500).send('Ichki server xatoligi');
    }
};
