const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    content:
        {
            type:String,
            trim:true
        },
    postedBy:
        {
            type: mongoose.Schema.Types.ObjectID,
            ref: 'User'
        },
    pinned:
        {
            type: Boolean
        },
    likes:
        [
            {
                type: mongoose.Schema.Types.ObjectID,
                ref: 'User',
            }
        ]
},{
    timestamps:true
});

const Post = mongoose.model('Post',postSchema);

module.exports = Post;