$(document).ready(()=>{
    $.get(`/api/chats/${chatId}`,(data)=>{
        $("#chatName").text(getChatName(data));
    })
})

$("#chatNameButton").click(()=>{
    const name = $("#chatNameTextbox").val().trim();
    $.ajax({
        url: "/api/chats/" + chatId,
        type: "PUT",
        data: {
            chatName: name
        },
        success: (data,success,xhr) => {
            if(xhr.status !== 204){
                return console.log("Could not update the chat name");
            }
            location.reload();
        }
    })
})