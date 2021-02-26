$("#postTextArea").keyup( event =>{
    const textBox = $(event.target);
    const value = textBox.val().trim();

    const submitButton = $("#submitPostButton");
    if(submitButton.length === 0){
        return alert("No submit button found");
    }

    if(value === ''){
        submitButton.prop("disabled",true);
        return;
    }

    submitButton.prop("disabled",false);
})

$("#submitPostButton").click(event=>{
    const button = $(event.target);
    const textBox = $("#postTextArea");
    const data = {
        content : textBox.val()
    }

    $.post("/api/posts",data, (postData) => {
        // console.log(postData);
        const html = createPostHtmls(postData);
        $(".postsContainer").prepend(html);
        textBox.val("");
        button.prop("disabled",true);
    })
})

function createPostHtmls(postData){
    const postedBy = postData.postedBy;
    const displayName = postedBy.firstName + " " + postedBy.lastName;
    const timestamp = postData.createdAt;

    return `<div class="post">
                <div class="mainContentContainer">
                    <div class="userImageContainer">
                        <img src="${postedBy.profilePic}" alt="">
                    </div>
                    <div class="postContentContainer">
                        <div class="header">
                            <a href="/profile/${postedBy.userName}" class="displayName">${displayName}</a>
                            <span class="username">@${postedBy.userName}</span>
                            <span class="date">${timestamp}</span>
                        </div>
                        <div class="postBody">
                            <span>${postData.content}</span>
                        </div>
                        <div class="postFooter">
                            <div class="postButtonContainer">
                                <button>
                                    <i class="far fa-comment"></i>
                                </button>
                            </div>
                            <div class="postButtonContainer">
                                <button>
                                    <i class="fas fa-retweet"></i>
                                </button>
                            </div>
                            <div class="postButtonContainer">
                                <button>
                                    <i class="far fa-heart"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}