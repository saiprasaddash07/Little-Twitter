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

function getChatByUserId(userLoggedInId,otherUserId) {
    // We want to create a chat between two users here
    // If the chat does not exist before we have to create it
    // So we have written isGroupChat: false
    // We are only interested in one-to-one chat so $size: 2
    // Then we are trying to find all the elements in the array where id == userLoggedInId || otherUserId
    // new: true,upsert: true means to create a new chat if it was not there
    // $setOnInsert it is used if we create a new chat then the users field will have 2 values
    return Chat.findOneAndUpdate({
        isGroupChat: false,
        users: {
            $size: 2,
            $all: [
                {
                    $elemMatch: {
                        $eq: mongoose.Types.ObjectId(userLoggedInId)
                    }
                },
                {
                    $elemMatch: {
                        $eq: mongoose.Types.ObjectId(otherUserId)
                    }
                }
            ]
        }
    },
    {
        $setOnInsert: {
            users : [userLoggedInId,otherUserId]
        }
    },
    {
            new: true,
            upsert: true
    }).populate("users");
}

// Description
// @desc    Get the inbox page here
// @route   GET /search
// @access  Private
router.get('/' ,(req,res,next)=>{
    const payload = {
        pageTitle: "Inbox",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    };
    res.status(200).render('inboxPage',payload);
})

// Description
// @desc    Get the inbox page here
// @route   GET /search
// @access  Private
router.get('/new' ,(req,res,next)=>{
    const payload = {
        pageTitle: "New Message",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    };
    res.status(200).render('newMessage',payload);
})

// Description
// @desc    Get the chat page by the id entered
// @route   GET /:chatId
// @access  Private
router.get('/:chatId' ,async (req,res,next)=>{
    const userId = req.session.user._id;
    const chatId = req.params.chatId;

    const isValidId = mongoose.isValidObjectId(chatId);

    const payload = {
        pageTitle: "Chat",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    };

    if(!isValidId){
        payload.errorMessage = "Chat does not exist or you do not have permission to view";
        return res.status(200).render('chatPage',payload);
    }

    let chat = await Chat.findOne({
        _id: chatId,
        users:
            {
                $elemMatch:
                    {
                        $eq: userId
                    }
            }
    }).populate("users");

    if(!chat){
        // Check if chat id is really user id

        const userFound = await User.findById(chatId);
        if(userFound){
            // Get chat using user id
            chat = await getChatByUserId(userFound._id,userId);
        }
    }

    if(!chat){
        // No chat
        payload.errorMessage = "Chat does not exist or you do not have permission to view";
    }else {
        // We have valid chat here
        payload.chat = chat;
    }
    res.status(200).render('chatPage',payload);
})

module.exports = router;