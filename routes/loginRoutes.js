const express =  require("express");
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../schemas/userSchema');
const bcrypt = require('bcrypt');

app.set('view engine','pug');
app.set('views','views');

app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

router.get('/' ,(req,res,next)=>{
    res.status(200).render('login');
})

router.post('/' ,async (req,res,next)=>{
    const payload = req.body;

    if(req.body.logUsername && req.body.logPassword){
        const user = await User.findOne({
            $or: [
                {userName: req.body.logUsername},
                {email: req.body.logUsername}
            ]
        }).catch(e => {
            console.log(e);

            payload.errorMessage = "Something went wrong here";
            res.status(200).render('login',payload);
        });

        if(user){
            const result = await bcrypt.compare(req.body.logPassword, user.password);
            if(result){
                req.session.user = user;
                return res.redirect("/");
            }
            payload.errorMessage = "Login credentials are wrong!";
            res.status(200).render('login',payload);
        }
    }

    payload.errorMessage = "Make sure each field has a valid value";
    return res.status(200).render('login');
})

module.exports = router;