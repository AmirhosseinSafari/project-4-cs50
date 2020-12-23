document.addEventListener('DOMContentLoaded', function() {
    
    if( document.querySelector('#new-post-form') ){
        document.querySelector('#new-post-form').onsubmit = send_post;
    }
    if( document.querySelector('#following') ){
        document.querySelector('#following').addEventListener('click', () => following())
    }

    document.querySelector('#follow-unfollow-btn').addEventListener('click', () => follow()) 

    load_box();
});

function load_box(){

    if( document.getElementById('#new-post-form') ){
        document.querySelector('#new-post-form').style.displlay = 'block';
    }
    document.querySelector('#all-posts').style.display = 'block';
    document.querySelector('#profile').style.display = 'none';
    document.querySelector('#followings').style.display = 'none';

    fetch('/posts')
    .then(response => response.json())
    .then(posts => {
        console.log(posts);
        // Showing posts
        pagination(posts, 'li-all-posts', "posts");
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
    
        pagination(posts, 'li-all-posts', "posts");
        
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
    if ( document.querySelector('#all-posts') ){
        document.querySelector('#all-posts').style.display = 'none';
    }
    
    document.querySelector('#followings').style.display = 'none';
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
    document.querySelector('#all-posts').style.display = 'none';
    document.querySelector('#profile').style.display = 'block';
    document.querySelector('#followings-posts').style.display = 'none';

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
    
    pagination(data.username_posts, 'li-profile', "profile-posts");

}

function post_show(posts, elemnet_id){

    posts_div = document.getElementById(elemnet_id);
    logged_in_user = document.querySelector('#logged-in-user').getAttribute("logged-in-user");

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

    
    //TOOD: sending put request and showing the user if he liked the post
    var heart = document.createElement("div");
    var i_heart = document.createElement("i");
    i_heart.style.color = "red";
    i_heart.classList.add("heart");
    i_heart.classList.add("fa");

    if ( post.likers.includes( logged_in_user ) ){

        if( i_heart.classList.contains("fa-heart-o") ){
            i_heart.classList.remove("fa-heart-o");
            i_heart.classList.add("fa-heart");
        }
        else{
            i_heart.classList.add("fa-heart");
        }

    }
    else{

        if( i_heart.classList.contains("fa-heart") ){
            i_heart.classList.remove("fa-heart");
            i_heart.classList.add("fa-heart-o");
        }
        else{
            i_heart.classList.add("fa-heart-o");
        }

    }

    heart.appendChild(i_heart);
    heart.onclick = function(){
        if( i_heart.classList.contains("fa-heart-o") ){
            
            //put request
            fetch(`like/${post.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                like: true
                })
            })
            .then(response => response.json())
            .then(posts => {
              console.log(posts);
              // Showing posts
              pagination(posts, 'li-all-posts', "posts");
            })

            i_heart.classList.remove("fa-heart-o");
            i_heart.classList.add("fa-heart");
        }
        else{

            //put request
            fetch(`like/${post.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                like: false
                })
            })
            .then(response => response.json())
            .then(posts => {
              console.log(posts);
              // Showing posts
              pagination(posts, 'li-all-posts', "posts");
            })

            i_heart.classList.remove("fa-heart");
            i_heart.classList.add("fa-heart-o");
        }
    }
    card_body.appendChild(heart);

    if ( logged_in_user == post.owner ){

        var edit_button = document.createElement("button");
        var textnode_edit_button = document.createTextNode("Edit");
        edit_button.appendChild(textnode_edit_button);
        edit_button.classList.add("btn");
        edit_button.classList.add("btn-info");
        edit_button.onclick = function(){
            edit_post(post, elemnet_id);
        }
        card_body.appendChild(edit_button);

    }

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

function following(){
    
    document.querySelector('#new-post').style.display = 'none';
    document.querySelector('#all-posts').style.display = 'none';
    document.querySelector('#profile').style.display = 'none';
    document.querySelector('#followings').style.display = 'block';
    document.querySelector('#followings-posts').innerHTML = "";

    logged_in_username = document.querySelector('#logged-in-user').getAttribute("logged-in-user");
    
    fetch(`/following/${logged_in_username}`)
    .then(response => response.json())
    .then( users_posts => {
        console.log(users_posts);
        
        pagination(users_posts, 'li-followings', "followings-posts");
        
    })
    .catch(err => {
        console.log(err);
    });

    return false 
}

function pagination(posts, li_element, destination){

    document.querySelector(`#${li_element}`).innerHTML = "";

    li_counts = Math.floor(posts.length / 11) + 1;
    div_li = document.querySelector(`#${li_element}`)
    div_li.style.display = "flex";
    div_li.style.cursor = "pointer";
    
    previous_button = document.createElement("li");
    previous_button.classList.add("page-item");
    previous_button_a = document.createElement("a");
    previous_button_a.classList.add("page-link");
    previous_button_a.setAttribute("tabindex", "-1");
    previous_button_a.setAttribute("aria-disabled", "true");
    previous_button_a_text = document.createTextNode("Previous");
    previous_button_a.appendChild(previous_button_a_text);
    previous_button.appendChild(previous_button_a);
    previous_button.id = `previous-${destination}`
    previous_button.onclick = function(){
        next_li = next_previous_button("previous", li_element, posts);
        console.log(next_li)
        pagination_slicer(posts, next_li, li_element, destination, "previous");
    }
    div_li.appendChild(previous_button);


    let counter;
    for(counter = 0; counter<li_counts ;counter++){
        
        var li = document.createElement("li");
        var a = document.createElement("a");
        var textnode_li = document.createTextNode(counter+1);
        a.appendChild(textnode_li);
        a.classList.add('page-link');
        li.classList.add('page-item');
        li.appendChild(a);
        li.id = `${li_element}-${counter+1}`
        li.onclick = function(){
            pagination_slicer(posts, li.id, li_element, destination, "");
        }
        div_li.appendChild(li);    
   
    }

    next_button = document.createElement("li");
    next_button.classList.add("page-item");
    next_button_a = document.createElement("a");
    next_button_a.classList.add("page-link");    
    next_button_a_text = document.createTextNode("Next");
    next_button_a.appendChild(next_button_a_text);
    next_button.appendChild(next_button_a);
    next_button.id = `next-${destination}`
    next_button.onclick = function(){
       next_li = next_previous_button("next", li_element, posts);
       console.log(next_li)
       pagination_slicer(posts, next_li, li_element, destination, "next");
    }
    div_li.appendChild(next_button);

    // For first time rendering we call it
    pagination_slicer(posts, `${li_element}-1`, li_element, destination, "");

    if ( document.querySelector(`#${li_element}-1`).classList.contains('active') ){
        previous_button.classList.add("disabled");
        previous_button.style.cursor = "default";
    }
    else if( previous_button.classList.contains("disabled") ){
        previous_button.classList.remove("disabled");
    }

    if ( document.querySelector(`#${li_element}-${li_counts}`).classList.contains('active') ){
        next_button.classList.add("disabled");
        next_button.style.cursor = "default";
    }
    else if( next_button.classList.contains("disabled") ){
        next_button.classList.remove("disabled");
    }

}

function pagination_slicer(posts, li_id, li_element , destination, next_or_not){
     
    if ( next_or_not != "previous" && next_or_not != "next"){
        window.onclick = e => {
            li_id = li_element + "-" + e.target.innerText;

            // if innertext is a number
            console.log(e.target.innerText)
            if ( !isNaN( e.target.innerText ) && e.target.innerText != "" ){  
                pagination_slicer(posts, li_id, li_element, destination, "");
            }
        }
    }

    li_count = Math.floor(posts.length / 11) + 1;

    for(count = 1; count<=li_count ; count++){
        if( document.querySelector(`#${li_element}-${count}`).classList.contains('active') ){
            document.querySelector(`#${li_element}-${count}`).classList.remove('active');
        }
    }
    console.log(li_id)
    document.querySelector(`#${li_id}`).classList.add("active");
    
    len_posts = posts.length;
    li_id_splited = li_id.split("-");
    partition =  li_id_splited[ li_id_splited.length-1 ];
    
    document.querySelector(`#${destination}`).innerHTML = "";

    if ( len_posts % 10 == 0 || partition != len_posts ){
        
        post_show( posts.slice(partition*10 - 10, partition*10), destination );

    }
    else{
              
        post_show( posts.slice(partition*10 -10, len_posts ), destination );

    }

    // next and previous button status checker
    if ( document.querySelector(`#${li_element}-1`).classList.contains('active') ){
        document.querySelector(`#previous-${destination}`).classList.add("disabled");
        document.querySelector(`#previous-${destination}`).style.cursor = "default";
    }
    else if( previous_button.classList.contains("disabled") ){
        document.querySelector(`#previous-${destination}`).classList.remove("disabled");
        document.querySelector(`#previous-${destination}`).style.cursor = "pointer";
    }

    if ( document.querySelector(`#${li_element}-${li_counts}`).classList.contains('active') ){
        document.querySelector(`#next-${destination}`).classList.add("disabled");
        document.querySelector(`#next-${destination}`).style.cursor = "default";
    }
    else if( next_button.classList.contains("disabled") ){
        document.querySelector(`#next-${destination}`).classList.remove("disabled");
        document.querySelector(`#next-${destination}`).style.cursor = "pointer";
    }

}

function next_previous_button(button_name , li_element, posts){

    li_number = Math.floor(posts.length / 11) + 1;
    var removed_active_li_element_number;

    for(count = 1; count<=li_number ; count++){
        if( document.querySelector(`#${li_element}-${count}`).classList.contains('active') ){
            removed_active_li_element_number = count;
        }
    }
    
    
    if (button_name == "next"){
        removed_active_li_element_number++;
        li_id = li_element + "-" + removed_active_li_element_number;
        return li_id
    }
    if (button_name == "previous"){
        removed_active_li_element_number--;
        li_id = li_element + "-" + removed_active_li_element_number;
        return li_id
    }

}

function edit_post(post, element_id){

    console.log(element_id)
    container = document.querySelector(`#${element_id}`)
    container.style.display = 'block';
    container.innerHTML = "";
    

    card = document.createElement("div");
    card.classList.add('card');
    card.setAttribute("style", "width: 50rem;");
    container.appendChild(card);

    card_body = document.createElement("div");
    card_body.classList.add('card-body');
    card.appendChild(card_body);

    card_title = document.createElement("h5");
    textnode_card_title = document.createTextNode(post.owner);
    card_title.appendChild(textnode_card_title);
    card_body.appendChild(card_title);
    card_title.style.cursor = "pointer"; 
    card_title.onclick = function(){
        profile(post.owner);
    }

    card_subtitle = document.createElement("h6");
    card_subtitle.classList.add('card-subtitle');
    card_subtitle.classList.add('mb-2');
    card_subtitle.classList.add('text-muted');
    textnode_card_subtitle = document.createTextNode(post.timestamp);
    card_subtitle.appendChild(textnode_card_subtitle);
    card_body.appendChild(card_subtitle)

    card_text = document.createElement("textarea");
    textnode_card_text = document.createTextNode(post.body);
    card_text.id = "edit-textarea"
    card_text.appendChild(textnode_card_text);
    card_body.appendChild(card_text);

    br = document.createElement("br");
    card_body.appendChild(br);

    save_edit_button = document.createElement("button");
    textnode_save_edit_button = document.createTextNode("Save");
    save_edit_button.appendChild(textnode_save_edit_button);
    save_edit_button.classList.add("btn");
    save_edit_button.classList.add("btn-success");
    save_edit_button.onclick = function(){
        console.log( post.id )
        //put request
        fetch(`edit/${post.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                body: card_text.value
            })
          })
          .then(response => response.json())
          .then(posts => {
            console.log(posts);
            // Showing posts
            card.remove()
            pagination(posts, 'li-all-posts', "posts");
        })
    }
    card_body.appendChild(save_edit_button);
}