const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    firstName:
        {
            type:String,
            required:true,
            trim:true
        },
    lastName:
        {
            type:String,
            required:true,
            trim:true
        },
    userName:
        {
            type:String,
            required:true,
            trim:true,
            unique:true
        },
    email:
        {
            type:String,
            required:true,
            unique:true,
            trim:true
        },
    password:
        {
            type:String,
            required:true
        },
    profilePic:
        {
            type:String,
            default:"/images/profilePic.jpeg"
        },
    coverPhoto:
        {
            type:String
        },
    likes:
        [
            {
                type: mongoose.Schema.Types.ObjectID,
                ref: 'Post',
            }
        ],
    retweets:
        [
            {
                type: mongoose.Schema.Types.ObjectID,
                ref: 'Post',
            }
        ],
    following:
        [
            {
                type: mongoose.Schema.Types.ObjectID,
                ref: 'User',
            }
        ],
    followers:
        [
            {
                type: mongoose.Schema.Types.ObjectID,
                ref: 'User',
            }
        ]
},{
    timestamps:true
});

const User = mongoose.model('User',userSchema);

module.exports = User;