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

function loadFollowers(){
    $.get(`/api/users/${profileUserId}/followers`, (results) => {
        outputUsers(results.followers,$(".resultsContainer"));
    })
}

function loadFollowings(){
    $.get(`/api/users/${profileUserId}/following`, (results) => {
        outputUsers(results.following,$(".resultsContainer"));
    })
}

$(document).ready(()=>{
    if(selectedTab === "followers"){
        loadFollowers();
    }else{
        loadFollowings();
    }
})