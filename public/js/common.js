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

$(document).on( "click",".followButton" ,event => {
    const button = $(event.target);
    const userId = button.data().user;

    if(!userId) return;
    $.ajax({
        url : `/api/users/${userId}/follow`,
        type: "PUT",
        success: (userData,status,xhr) => {
            if(xhr.status === "404"){
                return alert("User not found here");
            }

            let difference = 1;

            if(userData.following && userData.following.includes(userId)){
                button.addClass("following");
                button.text("Following");
            }else{
                button.removeClass("following");
                button.text("Follow");
                difference = -1;
            }

            const followersLabel = $("#followersValue");
            if(followersLabel.length !== 0){
                const followersText = +followersLabel.text();
                followersLabel.text(followersText+difference);
            }
        }
    })
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

// Global variables
let cropper;
let timer;
let selectedUsers = [];

$("#filePhoto").change((event)=>{
    const input = $(event.target)[0];
    if(input.files && input.files[0]){
        const reader = new FileReader();
        reader.onload = (e) => {
            const image  = document.getElementById("imagePreview");
            image.src = e.target.result;
            if(cropper){
                cropper.destroy();
            }
            cropper = new Cropper(image ,{
                aspectRatio: 1/1,
                background: false
            });
        }
        reader.readAsDataURL(input.files[0]);
    }
})

$("#coverPhoto").change((event)=>{
    const input = $(event.target)[0];
    if(input.files && input.files[0]){
        const reader = new FileReader();
        reader.onload = (e) => {
            const image  = document.getElementById("coverPreview");
            image.src = e.target.result;
            if(cropper){
                cropper.destroy();
            }
            cropper = new Cropper(image ,{
                aspectRatio: 16/9,
                background: false
            });
        }
        reader.readAsDataURL(input.files[0]);
    }
})

$("#imageUploadButton").click(()=>{
    const canvas = cropper.getCroppedCanvas();
    if(!canvas){
        console.log("Colud not upload image and make sure it is an image file");
    }

    canvas.toBlob((blob)=>{
        const formData = new FormData();
        formData.append("croppedImage",blob);

        $.ajax({
            url: "/api/users/profilePicture",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: () => {
                location.reload();
            }
        })
    })
})

$("#userSearchTextBox").keydown((event)=>{
    clearTimeout(timer);
    const textBox = $(event.target);
    let value = textBox.val();

    if(value === "" && (event.which === 8 || event.keyCode === 8)){
        //remove user from selection
        selectedUsers.pop();
        updateSelectedUsers();
        $(".resultsContainer").html("");
        if(selectedUsers.length === 0){
            $("#createChatButton").prop("disabled",true);
        }
        return;
    }

    timer = setTimeout(()=>{
        value = textBox.val().trim();
        if(value === ""){
            $(".resultsContainer").html("");
        }else{
            searchUsers(value);
        }
    },1000);
})

$("#coverPhotoUploadButton").click(()=>{
    const canvas = cropper.getCroppedCanvas();
    if(!canvas){
        console.log("Colud not upload image and make sure it is an image file");
    }

    canvas.toBlob((blob)=>{
        const formData = new FormData();
        formData.append("croppedImage",blob);

        $.ajax({
            url: "/api/users/coverPhoto",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: () => {
                location.reload();
            }
        })
    })
})

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


$("#deletePostModal").on("show.bs.modal",(event)=>{
    const button = $(event.relatedTarget);
    const postId = getPostIdFromElement(button);

    $("#deletePostButton").data("id",postId);
})

$("#confirmPinModal").on("show.bs.modal",(event)=>{
    const button = $(event.relatedTarget);
    const postId = getPostIdFromElement(button);

    $("#pinPostButton").data("id",postId);
})

$("#unPinModal").on("show.bs.modal",(event)=>{
    const button = $(event.relatedTarget);
    const postId = getPostIdFromElement(button);

    $("#unPinPostButton").data("id",postId);
})

$("#deletePostButton").click((event)=>{
    const postId = $(event.target).data("id");
    $.ajax({
        url : `/api/posts/${postId}`,
        type: "DELETE",
        success: () => {
            location.reload();
        }
    })
})

$("#pinPostButton").click((event)=>{
    const postId = $(event.target).data("id");
    $.ajax({
        url : `/api/posts/${postId}`,
        type: "PUT",
        data: {
            pinned: true
        },
        success: (data,status,xhr) => {
            if(xhr.status !== 204){
                return console.log("Could not pin the post!");
            }
            location.reload();
        }
    })
})

$("#unPinPostButton").click((event)=>{
    const postId = $(event.target).data("id");
    $.ajax({
        url : `/api/posts/${postId}`,
        type: "PUT",
        data: {
            pinned: false
        },
        success: (data,status,xhr) => {
            if(xhr.status !== 204){
                return console.log("Could not pin the post!");
            }
            location.reload();
        }
    })
})

$("#createChatButton").click((event)=>{
    const data = JSON.stringify(selectedUsers);
    $.post(`/api/chats`, { users: data}, chat => {
        if(!chat || !chat._id){
            console.log("Invalid response from the server");
        }
        window.location.href = `/messages/${chat._id}`;
    })
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

    let button = "";
    let pinnedPostText = "";

    if(postData.postedBy._id === userLoggedIn._id){
        let pinnedClass = "";
        let dataTarget = "#confirmPinModal";

        if(postData.pinned){
            pinnedClass = "active";
            dataTarget = "#unPinModal";
            pinnedPostText = `
                <i class="fas fa-thumbtack"> <span style="font-family: sans-serif;">Pinned Post</span></i>
            `;
        }

        button = `<button class='pinnedButton ${pinnedClass}' data-id="${postData._id}" data-toggle="modal" data-target='${dataTarget}'>
                        <i class="fas fa-thumbtack"></i>
                  </button>

                  <button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal">
                        <i class="fas fa-times"></i>
                  </button>`
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
                        <div class="pinnedPostText">${pinnedPostText}</div>
                        <div class="header">
                            <a href="/profile/${postedBy.userName}" class="displayName">${displayName}</a>
                            <span class="username">@${postedBy.userName}</span>
                            <span class="date">${timestamp}</span>
                            ${button}
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

function createUserHtml(userData,showFollowButton){
    const name = userData.firstName + " " + userData.lastName;

    const isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id) ;
    let followButton = "";
    const text = isFollowing ? "Following" : "Follow";
    const buttonClass = isFollowing ? "followButton following" : "followButton";

    if(showFollowButton && userLoggedIn._id !== userData._id){
        followButton = `
                            <div class="followButtonContainer">
                                <button class="${buttonClass}" data-user="${userData._id}">${text}</button>
                            </div>
                        `;
    }

    return `
                <div class="user">
                    <div class="userImageContainer">
                        <img src="${userData.profilePic}" alt="Image">
                    </div>
                    <div class="userDetailsContainer">
                        <div class="header">
                            <a href="/profile/${userData.userName}">${name}</a>
                            <span class="username">@${userData.userName}</span>
                        </div>
                    </div>
                    ${followButton}
                </div>
            `
}

function outputUsers(results,container) {
    container.html("");

    if(results.length === 0){
        container.append("<span class='noResults'>No results found already!</span>");
    }

    results.forEach(result => {
        const html = createUserHtml(result,true);
        container.append(html);
    })
}

function userSelected(user){
    selectedUsers.push(user);
    updateSelectedUsers();
    $("#userSearchTextBox").val("").focus();
    $(".resultsContainer").html("");
    $("#createChatButton").prop("disabled",false);
}

function outputSelectableUsers(results,container) {
    container.html("");

    if(results.length === 0){
        container.append("<span class='noResults'>No results found already!</span>");
    }

    results.forEach(result => {
        if(result._id === userLoggedIn._id || selectedUsers.some(u => u._id === result._id)){
            return;
        }

        const html = createUserHtml(result,false);
        const element = $(html);
        element.click(()=>{
            userSelected(result);
        })
        container.append(element);
    })
}

function searchUsers(searchTerm){
    $.get("/api/users", {
        search : searchTerm
    }, results => {
        outputSelectableUsers(results,$(".resultsContainer"))
    })
}

function updateSelectedUsers() {
    const elements = [];
    selectedUsers.forEach(user=>{
        const name = user.firstName + " " + user.lastName;
        const userElement = $(`
            <span class="selectedUser">${name}</span>
        `);
        elements.push(userElement);
    })
    $(".selectedUser").remove();
    $("#selectedUsers").prepend(elements);
}

function getChatName(chatData){
    let chatName = chatData.chatName;
    if(!chatName){
        const otherChatUsers = getOtherChatUsers(chatData.users);
        const namesArray = otherChatUsers.map(user => user.firstName + " " + user.lastName);
        chatName = namesArray.join(', ');
    }
    return chatName;
}

function getOtherChatUsers(users){
    if(users.length === 1){
        return users;
    }
    return users.filter(user => user._id !== userLoggedIn._id );
}