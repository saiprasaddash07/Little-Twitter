const express =  require("express");
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const path = require("path");
const User = require('../schemas/userSchema');

app.set('view engine','pug');
app.set('views','views');

app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

// Description
// @desc    Get the profile page of an user
// @route   GET /profile
// @access  Private
router.get('/images/:path' ,(req,res,next)=>{
    res.sendFile(path.join(__dirname,"../uploads/images/"+ req.params.path));
})

module.exports = router;