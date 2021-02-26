$(document).ready(()=>{
    $.get("/api/posts", (results) => {
        outputPosts(results,$(".postsContainer"));
    })
})

function outputPosts(results,container){
    container.html("");

    if(results.length === 0){
        container.append("<span>No posts are there!</span>");
    }

    results.forEach(result => {
        const html = createPostHtmls(result);
        container.append(html);
    })
}