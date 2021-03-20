const mongoose = require('mongoose');


const notificationSchema = mongoose.Schema({
    userTo:
        {
            type: mongoose.Schema.Types.ObjectID,
            ref: 'User'
        },
    userFrom:
        {
            type: mongoose.Schema.Types.ObjectID,
            ref: 'User'
        },
    notificationType:
        {
            type:String,
            trim:true
        },
    opened:
        {
            type: Boolean,
            default: false
        },
    entityId: mongoose.Schema.Types.ObjectID,
},{
    timestamps:true
});

notificationSchema.statics.insertNotification = async (userTo,userFrom,notificationType,entityId) =>{
    const data = {userTo,userFrom,notificationType,entityId};

    await Notification.deleteOne(data).catch(e=>{
        console.log(e);
    })

    return Notification.create(data).catch(e=>{
        console.log(e);
    });
}

const Notification = mongoose.model('Notification',notificationSchema);

module.exports = Notification;

/*
    We are using entityId because we do not know which type of notification is might be
    It can be someone who liked my post => In this case we want to go to post page
    It can be someone who followed me => In this case we want to go to user profile page
    So it can be postId, userId or anything else
    We are not using specific ids because it would require a lot of checking if one id field is null or not
*/