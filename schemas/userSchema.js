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
    likes:
        [
            {
                type: mongoose.Schema.Types.ObjectID,
                ref: 'Post',
            }
        ]
},{
    timestamps:true
});

const User = mongoose.model('User',userSchema);

module.exports = User;