const express =  require("express");
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../../schemas/userSchema');
const Post = require('../../schemas/postSchema');

app.use(bodyParser.urlencoded({extended : false}));

async function getPosts(filter){
    let post = await Post.find(filter)
        .populate("postedBy")
        .populate("retweetData")
        .populate("replyTo")
        .sort({
            "createdAt" : -1
        })
        .catch(e=> console.log(e));
    if(post){
        post = await User.populate(post,{path:"replyTo.postedBy"});
        return await User.populate(post,{path:"retweetData.postedBy"});
    }
}

router.get('/' ,async (req,res,next)=>{
    const searchObj = req.query;

    if(searchObj.isReply){
        const isReply = searchObj.isReply === "true";
        searchObj.replyTo = { $exists : isReply};
        delete searchObj.isReply;
    }

    if(searchObj.followingOnly){
        const followingOnly = searchObj.followingOnly === "true";
        if(followingOnly){
            const objIds = [];
            if(!req.session.user.following){
                req.session.user.following = [];
            }
            req.session.user.following.forEach(user=>{
                objIds.push(user);
            })
            objIds.push(req.session.user._id);
            searchObj.postedBy = { $in : objIds};
        }
        delete searchObj.followingOnly;
    }

    const results = await getPosts(searchObj);
    res.status(200).send(results);
})

router.get('/:id' ,async (req,res,next)=>{
    const postId = req.params.id;

    let postData = await getPosts({_id : postId});
    postData = postData[0];

    const results = {
        postData
    };

    if(postData.replyTo !== undefined){
        results.replyTo = postData.replyTo;
    }

    results.replies = await getPosts({replyTo : postId});

    res.status(200).send(results);
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

    if(req.body.replyTo){
        postData.replyTo = req.body.replyTo;
        console.log(postData);
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

router.put('/:id/like' ,async (req,res,next)=>{
    const postId = req.params.id;
    const userId = req.session.user._id;

    const isLiked = req.session.user.likes && req.session.user.likes.includes(postId);

    const option = isLiked ? "$pull" : "$addToSet";

    req.session.user =  await User.findByIdAndUpdate(userId, {
        [option]: {likes: postId}
    },{new:true}).catch(e=>{
        console.log(e);
        res.sendStatus(400);
    });

    const post =  await Post.findByIdAndUpdate(postId, {
        [option]: {likes: userId}
    },{new:true}).catch(e=>{
        console.log(e);
        res.sendStatus(400);
    });

    res.status(200).send(post);
})

router.post('/:id/retweet' ,async (req,res,next)=>{
    // Same condition as above
    const postId = req.params.id;
    const userId = req.session.user._id;

    // Try and delete retweet
    const deletedPost = await Post.findOneAndDelete({
        postedBy : userId,
        retweetData : postId
    }).catch(e=>{
        console.log(e);
        res.sendStatus(400);
    });

    const option = deletedPost ? "$pull" : "$addToSet";

    let repost = deletedPost;
    if(!repost){
        repost = await Post.create({
            postedBy: userId,
            retweetData: postId
        }).catch(e=>{
            console.log(e);
            res.sendStatus(400);
        });
    }

    req.session.user =  await User.findByIdAndUpdate(userId, {
        [option]: {retweets: repost._id}
    },{new:true}).catch(e=>{
        console.log(e);
        res.sendStatus(400);
    });

    const post =  await Post.findByIdAndUpdate(postId, {
        [option]: {retweetUsers: userId}
    },{new:true}).catch(e=>{
        console.log(e);
        res.sendStatus(400);
    });

    res.status(200).send(post);
})

router.delete("/:id",async (req,res,next)=>{
    await Post.findByIdAndDelete(req.params.id).catch(e=>{
        console.log(e);
        res.sendStatus(404);
    });
    return res.sendStatus(202);
})

module.exports = router;