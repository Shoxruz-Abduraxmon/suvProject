const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.getLogin = (req, res) => {
    res.render('login', { title: "Login" });
};

exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send('Barcha qatorlarni to‘ldiring');
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('Bizda bu foydalanuvchi mavjud emas');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Parol noto‘g‘ri');
        }

        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isActivated: user.isActivated
        };

        res.redirect('/home');
        
    } catch (error) {
        console.error('postLogin xatosi:', error);
        res.status(500).send('Ichki server xatoligi');
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout xatoligi:', err);
            return res.status(500).send('Chiqishda xatolik');
        }
        res.redirect('/login');
    });
};
