$(document).ready(()=>{
    $.get("/api/notifications",(data)=>{
        outputNotifications(data,$(".resultsContainer"));
    })
})

$("#markNotificationAsRead").click(()=> markNotificationsAsOpened());

function createNotifications(notification){
    const userFrom = notification.userFrom;
    const text = getNotificationText(notification);
    const href = getNotificationUrl(notification);
    const className = notification.opened ? "" : "active";

    return `<a href="${href}" class="resultListItem notification ${className}" data-id="${notification._id}">
                <div class="resultsImageContainer">
                    <img src="${userFrom.profilePic}">
                </div>
                <div class="resultsDetailsContainer ellipsis">
                    <span class="ellipsis">${text}</span>
                </div>
            </a>`
}

function outputNotifications(notifications,container){
    if(notifications.length === 0){
        return container.append("<span class='noResults'>Nothing to show here!</span>");
    }

    notifications.forEach(notification => {
        const html = createNotifications(notification);
        container.append(html);
    })
}

function getNotificationText(notification){
    const userFrom = notification.userFrom;

    if(!userFrom.firstName || !userFrom.lastName){
        console.log("User from is not populated");
    }

    const userFromName = `${userFrom.firstName} ${userFrom.lastName}`;

    let text;

    if(notification.notificationType === "retweet"){
        text = `${userFromName} has retweeted one of your posts`;
    }else if(notification.notificationType === "postLike"){
        text = `${userFromName} has liked one of your posts`;
    }else if(notification.notificationType === "reply"){
        text = `${userFromName} has replied to one of your posts`;
    }else if(notification.notificationType === "follow"){
        text = `${userFromName} has started following you`;
    }

    return `<span class="ellipsis">${text}</span>`;
}

function getNotificationUrl(notification){
    let url = "#";

    if(notification.notificationType === "retweet" ||
        notification.notificationType === "postLike" ||
        notification.notificationType === "reply"
    ){
        url = `/posts/${notification.entityId}`;
    }else if(notification.notificationType === "follow"){
        url = `/profile/${notification.entityId}`;
    }

    return url;
}