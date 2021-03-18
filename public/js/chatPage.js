$(document).ready(()=>{
    $.get(`/api/chats/${chatId}`,(data)=>{
        $("#chatName").text(getChatName(data));
    })

    $.get(`/api/chats/${chatId}/messages`,(data)=>{
        const messages = [];
        let lastSenderId = "";

        data.forEach((message, index)=>{
            const html = createMessageHTML(message,data[index+1], lastSenderId);
            messages.push(html);

            lastSenderId = message.sender._id;
        })

        const messagesHtml = messages.join("");
        addMessageHtmlToPage(messagesHtml);
        scrollToBottom(false);

        $(".loadingSpinnerContainer").remove();
        $(".chatContainer").css("visibility","visible");
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

function messageSubmitted() {
    const content = $(".inputTextBox").val().trim();
    if(content !== ""){
        sendMessage(content);
        $(".inputTextBox").val("");
    }
}

function sendMessage(content){
    $.post("/api/messages",{
        content,
        chatId,
    },(data,status,xhr)=>{
        if(xhr.status !== 201){
            alert("Could not send message");
            $(".inputTextBox").val(content);
            return;
        }

        addChatMessageHTML(data);
    })
}

$(".sendMessageButton").click(()=>{
    messageSubmitted();
})

$(".inputTextBox").keydown((event)=>{
    if(event.which === 13 && !event.shiftKey){
        messageSubmitted();
        return false;
    }
})

function addChatMessageHTML(message){
    if(!message || !message._id){
        return console.log("Message is not valid");
    }

    const messageDiv = createMessageHTML(message, null, "");
    addMessageHtmlToPage(messageDiv);
    scrollToBottom(true);
}

function createMessageHTML(message, nextMessage, lastSenderId){
    const sender = message.sender;
    const senderName = sender.firstName + " " + sender.lastName;

    const currentSenderId = sender._id;
    const nextSenderId = nextMessage ? nextMessage.sender._id : "";

    const isFirst = lastSenderId !== currentSenderId;
    const isLast = nextSenderId !== currentSenderId;

    const isMine = message.sender._id === userLoggedIn._id;
    let liClassname = isMine ? "mine" : "theirs";

    let nameElement = "";

    if(isFirst){
        liClassname+=" first";

        if(!isMine){
            nameElement = `<span class="senderName">${senderName}</span>`
        }
    }

    let profileImage = "";
    if(isLast){
        liClassname+=" last";
        profileImage = `<img src="${sender.profilePic}">`
    }

    let imageContainer="";
    if(!isMine){
        imageContainer = `<div class="imageContainer">
                                ${profileImage}
                          </div>`
    }

    return `<li class="message ${liClassname}">
                ${imageContainer}
                <div class="messageContainer">
                    ${nameElement}
                    <span class="messageBody">
                       ${message.content} 
                    </span>
                </div>
            </li>`;
}

function addMessageHtmlToPage(html){
    $(".chatMessages").append(html);
}

function scrollToBottom(animated) {
    const container = $(".chatMessages");
    const scrollHeight = container[0].scrollHeight;

    if(animated){
        container.animate({scrollTop: scrollHeight},"slow");
    }else{
        container.scrollTop(scrollHeight);
    }
}