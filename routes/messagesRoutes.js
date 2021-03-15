const express =  require("express");
const User = require('../schemas/userSchema');

const app = express();
const router = express.Router();

const bodyParser = require('body-parser');

app.set('view engine','pug');
app.set('views','views');

app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

// Description
// @desc    Get the inbox page here
// @route   GET /search
// @access  Private
router.get('/' ,(req,res,next)=>{
    const payload = {
        pageTitle: "Inbox",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    };
    res.status(200).render('inboxPage',payload);
})

// Description
// @desc    Get the inbox page here
// @route   GET /search
// @access  Private
router.get('/new' ,(req,res,next)=>{
    const payload = {
        pageTitle: "New Message",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    };
    res.status(200).render('newMessage',payload);
})

module.exports = router;