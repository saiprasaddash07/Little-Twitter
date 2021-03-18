const express =  require("express");
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../../schemas/userSchema');
const Message = require('../../schemas/messageSchema');
const Chat = require('../../schemas/chatSchema');
const Hello = require('../../schemas/helloSchema');

app.use(bodyParser.urlencoded({extended : false}));

// Description
// @desc    Posting a new message to db
// @route   POST /api/messages
// @access  Private
router.post('/' ,async (req,res,next)=>{
    if(!req.body.content || !req.body.chatId){
        console.log("Invalid data passed into the request");
        return res.sendStatus(400);
    }

    const newMessage = {
        sender: req.session.user._id,
        content: req.body.content,
        chat: req.body.chatId
    };

    let message = await Message.create(newMessage).catch(e=>{
        console.log(e);
        return res.sendStatus(400);
    });
    message = await message.populate("sender").execPopulate();
    message = await message.populate("chat").execPopulate();
    Chat.findByIdAndUpdate(req.body.chatId,{
        latestMessage: message
    }).catch(e=>{
        console.log(e);
    });
    res.status(201).send(message);
})

module.exports = router;