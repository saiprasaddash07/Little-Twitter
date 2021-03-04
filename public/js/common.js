$("#postTextArea, #replyTextArea").keyup( event =>{
    const textBox = $(event.target);
    const value = textBox.val().trim();

    const isModal = textBox.parents(".modal").length === 1;

    const submitButton = isModal ? $("#submitReplyButton") :  $("#submitPostButton");
    if(submitButton.length === 0){
        return alert("No submit button found");
    }

    if(value === ''){
        submitButton.prop("disabled",true);
        return;
    }

    submitButton.prop("disabled",false);
})

$("#submitPostButton, #submitReplyButton").click(event=>{
    const button = $(event.target);
    const isModal = button.parents(".modal").length === 1;

    const textBox = isModal ? $("#replyTextArea") : $("#postTextArea");
    const data = {
        content : textBox.val()
    }

    if(isModal){
        const id = button.data().id;
        if(id==null){
            return console.log("Button id is null");
        }
        data.replyTo = id;
    }

    $.post("/api/posts",data, (postData) => {
        if(postData.replyTo){
            location.reload();
        }else {
            const html = createPostHtmls(postData);
            $(".postsContainer").prepend(html);
            textBox.val("");
            button.prop("disabled", true);
        }
    })
})

$(document).on( "click",".likeButton" ,event=>{
    const button = $(event.target);
    const postId = getPostIdFromElement(button);

    if(!postId) return;
    $.ajax({
        url : `/api/posts/${postId}/like`,
        type: "PUT",
        success: (postData) => {
            button.find("span").text(postData.likes.length || "");
            if(postData.likes.includes(userLoggedIn._id)){
                button.addClass("active");
            }else{
                button.removeClass("active");
            }
        }
    })
})

$(document).on( "click",".retweetButton" ,event=>{
    const button = $(event.target);
    const postId = getPostIdFromElement(button);

    if(!postId) return;
    $.ajax({
        url : `/api/posts/${postId}/retweet`,
        type: "POST",
        success: (postData) => {
            button.find("span").text(postData.retweetUsers.length || "");
            if(postData.retweetUsers.includes(userLoggedIn._id)){
                button.addClass("active");
            }else{
                button.removeClass("active");
            }
        }
    })
})

$(document).on( "click",".post" ,event=>{
    const element = $(event.target);
    const postId = getPostIdFromElement(element);

    if(!postId) return;
    if(!element.is("button")) {
        window.location.href = '/posts/' + postId;
    }
})

function getPostIdFromElement(element) {
    const isRoot = element.hasClass("post");
    const rootElement = (isRoot) ? element : element.closest(".post");
    const postId = rootElement.data().id;
    if(postId === undefined){
        console.log("Post id is undefined");
        return;
    }
    return postId;
}

$("#replyModal").on("show.bs.modal",(event)=>{
    const button = $(event.relatedTarget);
    const postId = getPostIdFromElement(button);

    $("#submitReplyButton").data("id",postId);

    $.get(`/api/posts/${postId}`, (results) => {
        outputPosts(results.postData, $("#originalPostContainer"));
    })
})

$("#replyModal").on("hidden.bs.modal",(event)=>{
    $("#originalPostContainer").html("");
})

function createPostHtmls(postData, largeFonts = false){
    if(postData == null){
        return console.log("Post data is null here");
    }

    const isRetweet = postData.retweetData !== undefined;
    const retweetedBy = isRetweet ? postData.postedBy.userName : null;

    postData = isRetweet ? postData.retweetData : postData;

    const postedBy = postData.postedBy;

    if(postedBy._id === undefined){
        console.log("User object is not populated");
        return;
    }

    const displayName = postedBy.firstName + " " + postedBy.lastName;
    const timestamp = timeDifference(new Date(), new Date(postData.createdAt));

    const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? 'active' : "";
    const retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? 'active' : "";

    const largeFontClass = largeFonts ? "largeFont" : "";

    let retweetText = '';

    if(isRetweet){
        retweetText = `<span>
                            <i class="fas fa-retweet"></i>
                            Retweeted By <a href="/profile/${retweetedBy}">@${retweetedBy}</a>
                       </span>`
    }

    let replyFlag = "";
    if(postData.replyTo && postData.replyTo._id){

        // HERE WE ARE NOT ALLOWING NESTED REPLIES AFTER 2 LEVELS SO IMPLEMENT IT AFTER FINISH

        if(!postData.replyTo._id){
            return console.log("Reply to is not populated");
        }
        const temp = postData.replyTo.postedBy;
        if(!temp._id){
            return console.log("Reply to postedBy field is not populated");
        }
        const replyToUserName = temp.userName;
        replyFlag = `<div class="replyFlag">
                          Replying to <a href='/profile/${replyToUserName}'>@${replyToUserName}</a>
                    </div>`
    }

    return `<div class="post ${largeFontClass}" data-id="${postData._id}">
                <div class="postActionContainer">
                    ${retweetText}
                </div>
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
                        ${replyFlag}
                        <div class="postBody">
                            <span>${postData.content}</span>
                        </div>
                        <div class="postFooter">
                            <div class="postButtonContainer">
                                <button data-toggle="modal" data-target="#replyModal">
                                    <i class="far fa-comment"></i>
                                </button>
                            </div>
                            <div class="postButtonContainer green">
                                <button class="retweetButton ${retweetButtonActiveClass}">
                                    <i class="fas fa-retweet"></i>
                                    <span>${postData.retweetUsers.length || ""}</span>
                                </button>
                            </div>
                            <div class="postButtonContainer red">
                                <button class="likeButton ${likeButtonActiveClass}">
                                    <i class="far fa-heart"></i>
                                    <span>${postData.likes.length || ""}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}


function timeDifference(current, previous) {

    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000 < 30){
            return "Just Now";
        }
        return Math.round(elapsed/1000) + ' seconds ago';
    }

    else if (elapsed < msPerHour) {
        return Math.round(elapsed/msPerMinute) + ' minutes ago';
    }

    else if (elapsed < msPerDay ) {
        return Math.round(elapsed/msPerHour ) + ' hours ago';
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';
    }
}


function outputPosts(results,container){
    container.html("");

    if(!Array.isArray(results)){
        results = [results];
    }

    if(results.length === 0){
        container.append("<span>No posts are there!</span>");
    }

    results.forEach(result => {
        const html = createPostHtmls(result);
        container.append(html);
    })
}

function outputPostsWithReplies(results,container){
    container.html("");

    if(results.replyTo !== undefined && results.replyTo._id !== undefined){
        const html = createPostHtmls(results.replyTo);
        container.append(html);
    }

    const mainPostHtml = createPostHtmls(results.postData, true);
    container.append(mainPostHtml);

    results.replies.forEach(result => {
        const html = createPostHtmls(result);
        container.append(html);
    })
}