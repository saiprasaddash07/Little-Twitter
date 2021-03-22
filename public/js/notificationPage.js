$(document).ready(()=>{
    $.get("/api/notifications",(data)=>{
        outputNotifications(data,$(".resultsContainer"));
    })
})

$("#markNotificationAsRead").click(()=> markNotificationsAsOpened());