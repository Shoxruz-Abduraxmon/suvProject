// const Router = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

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
        
                const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
                res.status(200).redirect('home');
                
         } catch (e) {
                console.log(e);
                 res.status(500).send('Router login.js da xatolik');
             }
}