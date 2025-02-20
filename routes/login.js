const Router = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { title } = require('process');

const router = Router();

router.get('/', (req, res) => {
    res.render('login', {
        title: "Login",
        // loginError: req.flash('loginError')
    });
    
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            // req.flash('loginError', 'Parol noto`g`ri');
            res.send('Qatorlarni to`ldiring');
            return

        }
        
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).send({ msg: 'Bizda bu foydalanuvchi mavjud emas' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ msg: 'Parol noto`g`ri' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).render('home');
        
    } catch (e) {
        console.log(e);
        res.status(500).send('Router login.js da xatolik');
    }
});

module.exports = router;
