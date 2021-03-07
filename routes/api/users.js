const express =  require("express");
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../../schemas/userSchema');
const Post = require('../../schemas/postSchema');

app.use(bodyParser.urlencoded({extended : false}));

router.put('/:userId/follow' ,async (req,res,next)=>{
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if(!user){
        return res.sendStatus(404);
    }

    const isFollowing = user.followers && user.followers.includes(req.session.user._id);
    const option = isFollowing ? "$pull" : "$addToSet";

    req.session.user =  await User.findByIdAndUpdate(req.session.user._id, {
        [option]: {following: userId}
    },{new:true}).catch(e=>{
        console.log(e);
        res.sendStatus(400);
    });

    await User.findByIdAndUpdate(userId, {
        [option]: {followers: req.session.user._id}
    }).catch(e=>{
        console.log(e);
        res.sendStatus(400);
    });

    res.status(200).send(req.session.user);
})

router.get('/:userId/following' ,async (req,res,next)=>{
    const results = await User.findById(req.params.userId)
        .populate("following")
        .catch(e=>{
        console.log(e);
        res.sendStatus(400);
    });
    res.status(200).send(results);
})

router.get('/:userId/followers' ,async (req,res,next)=>{
    const results = await User.findById(req.params.userId)
        .populate("followers")
        .catch(e=>{
        console.log(e);
        res.sendStatus(400);
    });
    res.status(200).send(results);
})

module.exports = router;