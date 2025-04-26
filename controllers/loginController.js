const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const session = require('../middleware/session');

exports.getLogin = (req, res) => {
    res.render('login', {
         title: "Login"
         });
}
    
exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.send('Qatorlarni to`ldiring');
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send({ msg: 'Bizda bu foydalanuvchi mavjud emas' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ msg: 'Parol noto`g`ri' });
        }

        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isActivated: user.isActivated
        };

        res.redirect('/home');
        
    } catch (e) {
        console.log(e);
        res.status(500).send('Router login.js da xatolik');
    }
};
