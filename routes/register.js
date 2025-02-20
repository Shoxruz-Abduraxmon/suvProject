const Router = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = Router();

router.get('/register', (req, res) => {
    res.render('register')
});

router.post('/register', async (req, res) => {
    try{
        const {name, email, password, password2} = req.body;

        if(!name || !email || !password || !password2) {
           return res.status(404).send({mgs: 'Barcha qatorlarni to`ldiring '});
        }

        if(password.length < 5) {
           return res.status(404).send({mgs: 'Parol kalmida 5 belgi bo`lishi kerak'});
        }

        if(password !== password2) {
           return res.status(404).send({mgs: 'Parol bir xil emas'});
        }

        const borEmail = await User.findOne({email});

         if(borEmail) {
          return  res.status(404).send({mgs: 'bu email oldin ro`yxatdan o`tgan'})
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email, 
            password: hashedPassword,
        })

        await newUser.save();


        res.render('login');
        console.log("name: " + name, "email: "+ email, "password: " +password, "password2" + password2);
    
    }catch (e) {
        console.log(e);
        res.status(404).send({mgs: 'Ulashda xatalik'})
    }
    
})

module.exports = router;