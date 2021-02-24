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

    $.post("/api/posts",data, (postData,status,xhr) => {

    })
})