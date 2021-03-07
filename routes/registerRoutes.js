const express =  require("express");
const User = require('../schemas/userSchema');

const app = express();
const router = express.Router();

const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

app.set('view engine','pug');
app.set('views','views');

app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

// Description
// @desc    Render the register page on landing page
// @route   GET /register
// @access  Public
router.get('/' ,(req,res,next)=>{
    res.status(200).render('register');
})

// Description
// @desc    Registration route
// @route   POST /register
// @access  Public
router.post('/' ,async (req,res,next)=>{

    const firstName = req.body.firstName.trim();
    const lastName = req.body.lastName.trim();
    const userName = req.body.userName.trim();
    const email = req.body.email.trim();
    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;

    const payload = req.body;

    if(password !== passwordConfirm){
        payload.errorMessage = "Make sure password and confirm password are same!";
        return res.redirect('/register',payload);
    }

    if(firstName && lastName && userName && email && password){
        const user = await User.findOne({
            $or: [
                {userName: userName},
                {email: email}
            ]
        }).catch(e => {
            console.log(e);

            payload.errorMessage = "Something went wrong here";
            res.status(200).render('register',payload);
        });

        if(user === null){
            const data = req.body;
            data.password = await bcrypt.hash(password,10);
            const user = await User.create(data);
            req.session.user = user;
            return res.redirect('/');
        }else{
            if(email === user.email){
                payload.errorMessage = "Email already in use";
            }else{
                payload.errorMessage = "Username already in use";
            }
        }
    }else{
        payload.errorMessage = "Make sure each field has a valid value!";
        res.status(200).render('register',payload);
    }
})

module.exports = router;