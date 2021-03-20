const express =  require("express");
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require("path");
const fs = require("fs");
const User = require('../../schemas/userSchema');
const Notification = require('../../schemas/notificationSchema');

const upload = multer({
    dest : "uploads/"
});

app.use(bodyParser.urlencoded({extended : false}));

// Description
// @desc    Searching the users functionality
// @route   GET /api/users/
// @access  Private
router.get('/' ,async (req,res,next)=> {
    let searchObj = req.query;

    if(req.query.search){
        searchObj = {
            $or: [
                {
                    firstName: {
                        $regex: req.query.search,
                        $options: "i"
                    }
                },
                {
                    lastName: {
                        $regex: req.query.search,
                        $options: "i"
                    }
                },
                {
                    userName: {
                        $regex: req.query.search,
                        $options: "i"
                    }
                }
            ]
        };
        const user = await User.find(searchObj).catch(e=>{
            console.log(e);
            res.sendStatus(400);
        });
        if(user){
            res.status(200).send(user);
        }
    }
})

// Description
// @desc    Following user
// @route   PUT /api/users/:userId/follow
// @access  Private
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

    if(!isFollowing){
        await Notification.insertNotification(userId,req.session._id,"follow",req.session.user._id);
    }

    res.status(200).send(req.session.user);
})

// Description
// @desc    Get all the following users
// @route   GET /api/users/:userId/following
// @access  Private
router.get('/:userId/following' ,async (req,res,next)=>{
    const results = await User.findById(req.params.userId)
        .populate("following")
        .catch(e=>{
        console.log(e);
        res.sendStatus(400);
    });
    res.status(200).send(results);
})

// Description
// @desc    Get the followers user
// @route   GET /api/users/:userId/followers
// @access  Private
router.get('/:userId/followers' ,async (req,res,next)=>{
    const results = await User.findById(req.params.userId)
        .populate("followers")
        .catch(e=>{
        console.log(e);
        res.sendStatus(400);
    });
    res.status(200).send(results);
})

// Description
// @desc    Post the profile image here
// @route   POST /api/users/profilePicture
// @access  Private
router.post('/profilePicture', upload.single("croppedImage"), async (req,res,next)=>{
    if(!req.file){
        console.log("No file is uploaded with ajax request");
        return res.sendStatus(400);
    }

    const filePath = `/uploads/images/${req.file.filename}.png`;
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname,`../../${filePath}`);
    fs.rename(tempPath,targetPath,async (e)=>{
        if(e){
            console.log(e);
            return res.sendStatus(400);
        }

        req.session.user = await User.findByIdAndUpdate(req.session.user._id,{
            profilePic: filePath
        },{new:true});

        res.sendStatus(204);
    });
})

// Description
// @desc    Post the profile image here
// @route   POST /api/users/profilePicture
// @access  Private
router.post('/coverPhoto', upload.single("croppedImage"), async (req,res,next)=>{
    if(!req.file){
        console.log("No file is uploaded with ajax request");
        return res.sendStatus(400);
    }

    const filePath = `/uploads/images/${req.file.filename}.png`;
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname,`../../${filePath}`);
    fs.rename(tempPath,targetPath,async (e)=>{
        if(e){
            console.log(e);
            return res.sendStatus(400);
        }

        req.session.user = await User.findByIdAndUpdate(req.session.user._id,{
            coverPhoto: filePath
        },{new:true});

        res.sendStatus(204);
    });
})

module.exports = router;