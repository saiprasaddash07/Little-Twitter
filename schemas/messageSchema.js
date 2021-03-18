const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    sender :
        {
            type: mongoose.Schema.Types.ObjectID,
            ref: 'User',
        },
    content:
        {
            type: String,
            trim: true
        },
    chat:
        {
            type: mongoose.Schema.Types.ObjectID,
            ref: 'Chat',
        },
    readBy:
        [
            {
                type: mongoose.Schema.Types.ObjectID,
                ref: 'User',
            }
        ]
},{
    timestamps:true
});

const Message = mongoose.model('Message',messageSchema);

module.exports = Message;