document.addEventListener('DOMContentLoaded', function() {
    
    if( document.querySelector('#new-post-form') ){
        document.querySelector('#new-post-form').onsubmit = send_post;
    }

    document.querySelector('#follow-unfollow-btn').addEventListener('click', () => follow())

    load_box();
});

function load_box(){

    if( document.getElementById('#new-post-form') ){
        document.querySelector('#new-post-form').style.displlay = 'block';
    }
    document.querySelector('#posts').style.display = 'block';
    document.querySelector('#profile').style.display = 'none';

    fetch('/posts')
    .then(response => response.json())
    .then(posts => {
        console.log(posts);
        // Showwing posts
        post_show(posts, 'posts');
    })

}

function send_post(){

    const new_post_body = document.querySelector('#new-post-body').value;

    fetch('/posts', {
        method: 'POST',
        body: JSON.stringify({
            new_post_body: new_post_body
        })
    })
    .then(response => response.json())
    .then(posts => {
        console.log(posts);

        document.querySelector('#new-post-body').value = "";
        document.querySelector('#posts').innerHTML = "";
        post_show(posts, "posts")
        
    })
    .catch(err => {
        console.log(err);
    });

    return false
}

function profile(username){

    if( document.getElementById('#new-post-form') ){
        document.querySelector('#new-post-form').style.display = 'none';
    }
    if ( document.querySelector('#posts') ){
        document.querySelector('#posts').style.display = 'none';
    }
    
    document.querySelector('#profile').style.display = 'block';

    fetch(`/profile/${username}`)
    .then(response => response.json())
    .then( data => {
        console.log(data);
        show_profile(data);
    })
    .catch(err => {
        console.log(err);
    });
}

var username_follow_info;

function show_profile(data){

    document.querySelector('#new-post').style.display = 'none';
    document.querySelector('#posts').style.display = 'none';
    document.querySelector('#profile').style.display = 'block';

    document.querySelector('#profile-username').innerHTML = data.profile.user;
    document.querySelector('#profile-Followings').innerHTML = data.profile.follows.length;
    document.querySelector('#profile-followers').innerHTML = data.profile.followers.length;
    follow_btn = document.querySelector('#follow-unfollow-btn');

    username_follow_info = data.profile;

    logged_in_user = document.querySelector('#logged-in-user').getAttribute("logged-in-user");
    if( logged_in_user == data.profile.user ){
        document.querySelector('#follow-button').style.display = 'none';
    }

    if ( data.profile.followers.includes(logged_in_user) ){
        follow_btn.innerHTML = 'Unfollow';
        if ( follow_btn.classList.contains('btn-primary') ){
            follow_btn.classList.remove('btn-primary');
            follow_btn.classList.add('btn-warning');
        }
    }
    else{
        follow_btn.innerHTML = 'Follow';
        if ( follow_btn.classList.contains('btn-warning') ){
            follow_btn.classList.remove('btn-warning');
            follow_btn.classList.add('btn-primary');
        }
    }

    document.querySelector('#profile-posts').innerHTML = "";
    post_show(data.username_posts, 'profile-posts')
}

function post_show(posts, elemnet_id){

    posts_div = document.getElementById(elemnet_id);

    posts.forEach(post => {

    var card = document.createElement("div");
    card.classList.add('card');
    card.setAttribute("style", "width: 50rem;");
    posts_div.appendChild(card);

    var card_body = document.createElement("div");
    card_body.classList.add('card-body');
    card.appendChild(card_body);

    var card_title = document.createElement("h5");
    var textnode_card_title = document.createTextNode(post.owner);
    card_title.appendChild(textnode_card_title);
    card_body.appendChild(card_title);
    card_title.style.cursor = "pointer"; 
    card_title.onclick = function(){
        profile(post.owner);
    }

    var card_subtitle = document.createElement("h6");
    card_subtitle.classList.add('card-subtitle');
    card_subtitle.classList.add('mb-2');
    card_subtitle.classList.add('text-muted');
    var textnode_card_subtitle = document.createTextNode(post.timestamp);
    card_subtitle.appendChild(textnode_card_subtitle);
    card_body.appendChild(card_subtitle)

    var card_text = document.createElement("p");
    var textnode_card_text = document.createTextNode(post.body);
    card_text.appendChild(textnode_card_text);
    card_body.appendChild(card_text);

    var like_span = document.createElement("span");
    var textnode_like_span = document.createTextNode("Like " + post.likes_count);
    like_span.appendChild(textnode_like_span);
    card_body.appendChild(like_span);
    
    var heart = document.createElement("div");
    var i_heart = document.createElement("i");
    i_heart.style.color = "red"; 
    i_heart.classList.add('fa');
    i_heart.classList.add('fa-heart-o');
    heart.appendChild(i_heart);
    heart.onclick = function(){
        if( i_heart.classList.contains("fa-heart-o") ){
            i_heart.classList.remove("fa-heart-o");
            i_heart.classList.add("fa-heart");
        }
        else{
            i_heart.classList.remove("fa-heart");
            i_heart.classList.add("fa-heart-o");
        }
    }
    card_body.appendChild(heart);

    });

    return false
}

function setAttributes(element, attrs) {
    for(var key in attrs) {
        element.setAttribute(key, attrs[key]);
    }
}

function follow(){
    
    logged_in_user = document.querySelector('#logged-in-user').getAttribute("logged-in-user");
    user_page_name = document.querySelector('#profile-username').innerHTML;

    if ( username_follow_info.followers.includes(logged_in_user) ){

        //TODO: sending put request to loged in user, be added to user followers and him self followings
        fetch('/update_following_followers',{
            method: 'PUT',
            body: JSON.stringify({
                logged_in_user: logged_in_user,
                user_page_name: user_page_name,
                follow_request: 'unfollow'
            })
        })
        .then(response => response.json() )
        .then( result =>  {
            console.log(result)
            profile(user_page_name)
        })
        .catch(err => {
            console.log(err);
          });

    }
    else{

        fetch('/update_following_followers',{
            method: 'PUT',
            body: JSON.stringify({
                logged_in_user: logged_in_user,
                user_page_name: user_page_name,
                follow_request: 'follow'
            })
        })
        .then(response => response.json() )
        .then( result =>  {
            console.log(result)
            profile(user_page_name)
        })
        .catch(err => {
            console.log(err);
          });
    }

}