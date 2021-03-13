const express =  require("express");
const User = require('../schemas/userSchema');

const app = express();
const router = express.Router();

const bodyParser = require('body-parser');

app.set('view engine','pug');
app.set('views','views');

app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

function createPayload(userLoggedIn){
    return {
        pageTitle: "Search",
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn)
    };
}

// Description
// @desc    Get the search page of an user
// @route   GET /search
// @access  Private
router.get('/' ,(req,res,next)=>{
    const payload = createPayload(req.session.user);
    res.status(200).render('searchPage',payload);
})

// Description
// @desc    Get the selected tab
// @route   GET /search
// @access  Private
router.get('/:selectedTab' ,(req,res,next)=>{
    const payload = createPayload(req.session.user);
    payload.selectedTab = req.params.selectedTab;
    res.status(200).render('searchPage',payload);
})

module.exports = router;