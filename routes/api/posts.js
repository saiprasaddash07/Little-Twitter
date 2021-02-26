const express =  require("express");
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../../schemas/userSchema');
const Post = require('../../schemas/postSchema');

app.use(bodyParser.urlencoded({extended : false}));

router.get('/' ,async (req,res,next)=>{
    const post = await Post.find()
        .populate("postedBy")
        .sort({
            "createdAt" : -1
        })
        .catch(e=>{
            console.log(e);
            return res.sendStatus(400);
    });
    if(post){
        res.status(200).send(post);
    }
})

router.post('/' ,async (req,res,next)=>{
    if(!req.body.content){
        console.log("Content param not sent with request");
        return res.sendStatus(400);
    }

    const postData ={
        content : req.body.content,
        postedBy: req.session.user
    }

    let post = await Post.create(postData).catch(e=>{
        console.log(e);
        return res.sendStatus(400);
    });

    post = await User.populate(post,{
        path: "postedBy"
    })

    res.status(201).send(post);
})

module.exports = router;