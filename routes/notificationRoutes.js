const express =  require("express");
const User = require('../schemas/userSchema');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const Chat = require('../schemas/chatSchema');
const mongoose = require("mongoose");

app.set('view engine','pug');
app.set('views','views');

app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

// Description
// @desc    Get the notification page here
// @route   GET /notifications
// @access  Private
router.get('/' ,(req,res,next)=>{
    const payload = {
        pageTitle: "Notifications",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    };
    res.status(200).render('notificationPage',payload);
})

module.exports = router;