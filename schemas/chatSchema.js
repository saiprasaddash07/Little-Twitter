const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
    chatName :
        {
            type: String,
            trim: true
        },
    isGroupChat :
        {
            type: Boolean,
            default: false
        },
    users:
        [
            {
                type: mongoose.Schema.Types.ObjectID,
                ref: 'User',
            }
        ],
    latestMessage:
        {
            type: mongoose.Schema.Types.ObjectID,
            ref: 'Message',
        }
},{
    timestamps:true
});

const Chat = mongoose.model('Chat',chatSchema);

module.exports = Chat;