const express =  require("express");
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../schemas/userSchema');

app.set('view engine','pug');
app.set('views','views');

app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

router.get("/",(req,res,next)=>{
    return res.send("Hello");
})

router.get('/:id' ,(req,res,next)=>{
    const payload = {
        pageTitle : 'View post',
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        postId: req.params.id
    }
    return res.status(200).render('postPage', payload);
})

module.exports = router;