function outputPinnedPosts(results,container){
    if(results.length === 0){
        return container.hide();
    }

    container.html("");

    results.forEach(result => {
        const html = createPostHtmls(result);
        container.append(html);
    })
}

function loadPosts(){
    $.get("/api/posts", { postedBy: profileUserId, pinned: true }, (results) => {
        outputPinnedPosts(results,$(".pinnedPostContainer"));
    })

    $.get("/api/posts", { postedBy: profileUserId, isReply: false }, (results) => {
        outputPosts(results,$(".postsContainer"));
    })
}

function loadReplies(){
    $.get("/api/posts", { postedBy: profileUserId, isReply: true }, (results) => {
        outputPosts(results,$(".postsContainer"));
    })
}

$(document).ready(()=>{
    if(selectedTab === "replies"){
        loadReplies();
    }else{
        loadPosts();
    }
})