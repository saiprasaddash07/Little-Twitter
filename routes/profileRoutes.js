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

// Description
// @desc    Get the profile page of an user
// @route   GET /profile
// @access  Private
router.get('/' ,(req,res,next)=>{
    const payload = {
        pageTitle: req.session.user.userName,
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        profileUser: req.session.user
    }

    res.status(200).render('profilePage',payload);
})

// Description
// @desc    Get the profile user based on the id
// @route   GET /profile/:username
// @access  Private
router.get('/:username' ,async (req,res,next)=>{
    const payload = await getPayload(req.params.username,req.session.user);

    res.status(200).render('profilePage',payload);
})

// Description
// @desc    Fetch the replies for an user
// @route   GET /profile/:username/replies
// @access  Private
router.get('/:username/replies' ,async (req,res,next)=>{
    const payload = await getPayload(req.params.username,req.session.user);
    payload.selectedTab = "replies";
    res.status(200).render('profilePage',payload);
})

// Description
// @desc    Get all the following people
// @route   GET /profile/:username/following
// @access  Private
router.get('/:username/following' ,async (req,res,next)=>{
    const payload = await getPayload(req.params.username,req.session.user);
    payload.selectedTab = "following";
    res.status(200).render('followersAndFollowing',payload);
})

// Description
// @desc    Get all the followers people
// @route   GET /profile/:username/followers
// @access  Private
router.get('/:username/followers' ,async (req,res,next)=>{
    const payload = await getPayload(req.params.username,req.session.user);
    payload.selectedTab = "followers";
    res.status(200).render('followersAndFollowing',payload);
})

module.exports = router;