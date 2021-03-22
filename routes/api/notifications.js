const express =  require("express");
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../../schemas/userSchema');
const Message = require('../../schemas/messageSchema');
const Chat = require('../../schemas/chatSchema');
const Notification = require('../../schemas/notificationSchema');

app.use(bodyParser.urlencoded({extended : false}));

// Description
// @desc    Get notification
// @route   GET /api/notifications
// @access  Private
router.get('/' ,async (req,res,next)=>{
    const searchObj = {
        userTo: req.session.user._id,
        notificationType:
            {
                $ne : "newMessage"
            }
    }

    if(req.query.unreadOnly && req.query.unreadOnly === "true"){
        searchObj.opened = false;
    }

    const notification = await Notification.find(searchObj)
    .populate("userTo")
    .populate("userFrom")
    .sort({createdAt: -1})
    .catch(e=>{
        console.log(e);
        res.sendStatus(400);
    });
    res.status(200).send(notification);
})

// Description
// @desc    Updating the notification badge
// @route   GET /api/notifications
// @access  Private
router.get('/latest' ,async (req,res,next)=>{

    const notification = await Notification.findOne({userTo: req.session.user._id})
    .populate("userTo")
    .populate("userFrom")
    .sort({createdAt: -1})
    .catch(e=>{
        console.log(e);
        res.sendStatus(400);
    });
    res.status(200).send(notification);
})

// Description
// @desc    Make a particular notification marked read
// @route   POST /api/notifications/:id/markAsOpened
// @access  Private
router.put('/:id/markAsOpened' ,async (req,res,next)=>{
    const notification = await Notification.findByIdAndUpdate(req.params.id, {opened:true})
    .catch(e=>{
        console.log(e);
        res.sendStatus(400);
    });
    res.sendStatus(204);
})

// Description
// @desc    Make all the notifications marked read
// @route   POST /api/notifications/markAsOpened
// @access  Private
router.put('/markAsOpened' ,async (req,res,next)=>{
    const notification = await Notification.updateMany({userTo: req.session.user._id,}, {opened:true})
    .catch(e=>{
        console.log(e);
        res.sendStatus(400);
    });
    res.sendStatus(204);
})

module.exports = router;