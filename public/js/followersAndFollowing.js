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