function outputChatList(chatList, container) {
    if(chatList.length === 0){
        container.append("<span class='noResults'>Nothing to show here</span>");
    }

    chatList.forEach(chat =>{
        const html = createChatHtml(chat);
        container.append(html);
    })
}

$(document).ready(()=>{
    $.get("/api/chats",(data,status,xhr)=>{
        if(xhr.status === 400){
            return console.log("Could not get the chat list");
        }
        outputChatList(data,$(".resultsContainer"));
    })
})