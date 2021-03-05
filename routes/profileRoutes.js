const express =  require("express");
const User = require('../schemas/userSchema');

const app = express();
const router = express.Router();

const bodyParser = require('body-parser');

app.set('view engine','pug');
app.set('views','views');

app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

async function getPayload(username,userLoggedIn) {
    let user = await User.findOne({userName : username });
    if(!user){
        user = await User.findById(username);
        if(!user) {
            return {
                pageTitle: "User not found here",
                userLoggedIn,
                userLoggedInJs: JSON.stringify(userLoggedIn)
            };
        }
    }

    return {
        pageTitle: user.userName,
        userLoggedIn ,
        userLoggedInJs: JSON.stringify(userLoggedIn),
        profileUser: user
    };
}

router.get('/' ,(req,res,next)=>{
    const payload = {
        pageTitle: req.session.user.userName,
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        profileUser: req.session.user
    }

    res.status(200).render('profilePage',payload);
})

router.get('/:username' ,async (req,res,next)=>{
    const payload = await getPayload(req.params.username,req.session.user);

    res.status(200).render('profilePage',payload);
})


router.get('/:username/replies' ,async (req,res,next)=>{
    const payload = await getPayload(req.params.username,req.session.user);
    payload.selectedTab = "replies";
    res.status(200).render('profilePage',payload);
})

module.exports = router;