const express =  require("express");
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../../schemas/userSchema');
const Chat = require('../../schemas/chatSchema');

app.use(bodyParser.urlencoded({extended : false}));

// Description
// @desc    Creating a new chat window
// @route   POST /api/chats
// @access  Private
router.post('/' ,async (req,res,next)=>{
    if(!req.body.users){
        console.log("Users param not send with request");
        return res.sendStatus(404);
    }

    const users = JSON.parse(req.body.users);

    if(users.length === 0){
        console.log("Users array is empty here");
        return res.sendStatus(404);
    }

    users.push(req.session.user);

    const chatData = {
        users: users,
        isGroupChat: true
    }

    const results = await Chat.create(chatData).catch(e=>{
        console.log(e);
        return res.sendStatus(404);
    });
    res.status(200).send(results);
})

// Description
// @desc    Retrieving chats
// @route   GET /api/chats
// @access  Private
router.get('/' ,async (req,res,next)=>{
    const results = await Chat.find({
        users: {
            $elemMatch: { // users object is an array and we are trying to find the chats in which we are part of
                $eq: req.session.user._id
            }
        }
    }).populate("users").catch(e=>{
        console.log(e);
        return res.sendStatus(400);
    })
    res.status(200).send(results);
})

module.exports = router;