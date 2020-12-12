document.addEventListener('DOMContentLoaded', function() {

    document.querySelector('#new-post-form').onsubmit = send_post;

});

function send_post(){

    const new_post_body = document.querySelector('#new-post-body').value;

    fetch('/posts', {
        method: 'POST',
        body: JSON.stringify({
            new_post_body: new_post_body
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);

        if(result.message){
            new_post_body = document.querySelector('#new-post-body').value = "";
        }
    })
    .catch(err => {
        console.log(err);
    });

    return false
}
