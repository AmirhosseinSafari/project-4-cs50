from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from datetime import datetime
from functools import reduce

from .models import User, Post, Follow

@csrf_exempt
def index(request):

    # Authenticated users view their inbox
    if request.user.is_authenticated:
        return render(request, "network/index.html")

    # Everyone else is prompted to sign in
    else:
        return HttpResponseRedirect(reverse("login"))


def login_view(request): 
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()

            profile = Follow(
                person=user,
            )
            profile.save()
            profile.follows.remove(user)
            profile.save()

        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@login_required
@csrf_exempt
def posts(request):
    if request.method == 'POST':
        
        data = json.loads(request.body)
        
        if data.get("new_post_body") == [""]:
            return JsonResponse({
                "error": "Post couldn't be empty"
            }, status=400)
        
        new_post_body = data.get("new_post_body", "")

        post = Post(
            owner=request.user,
            body=new_post_body
        )
        post.save()
        
        all_posts = Post.objects.order_by("-timestamp").all()

        return JsonResponse([post.serialize() for post in all_posts], safe=False, status=201)

    # Preventing that a user post without login
    if  request.method == 'POST' and not request.user.is_authenticated:       
        return HttpResponseRedirect(reverse("login"))

    else:
        # Return posts in reverse chronologial order
        all_posts = Post.objects.order_by("-timestamp").all()

        return JsonResponse([post.serialize() for post in all_posts], safe=False)
 

@login_required
def profile(request, username):
    
    user = User.objects.get(username=username)
    profile = Follow.objects.get( person=user )
    username_posts = Post.objects.filter( owner=user )

    username_posts = username_posts.order_by("-timestamp").all()

    content = {
        'username_posts': [post.serialize() for post in username_posts],
        'profile': profile.serialize()
    }
    return JsonResponse( content, safe=False )

@login_required
@csrf_exempt
def update_following_followers(request):
    if request.method == 'PUT':
        
        data = json.loads(request.body)

        logged_in_user = data.get("logged_in_user", "")
        user_page_name = data.get("user_page_name", "")
        follow_request = data.get("follow_request", "")

        print(follow_request)
        
        user_page = User.objects.get(username=user_page_name)
        person_page = Follow.objects.get(person=user_page)
        
        logged_in_user_page = User.objects.get(username=logged_in_user)
        person_logged_in = Follow.objects.get(person=logged_in_user_page)

        if follow_request == "unfollow":
            print("here1")
            person_page.followers.remove(logged_in_user_page)
            person_logged_in.follows.remove(user_page)

            person_page.save()
            person_logged_in.save()
            return JsonResponse({"message": "user unfollowed saved successfully."}, status=201)

        if follow_request == "follow":
            print("here2")
            person_page.followers.add(logged_in_user_page)
            person_logged_in.follows.add(user_page)

            person_page.save()
            person_logged_in.save()
            return JsonResponse({"message": "userr followed successfully."}, status=201)

    else:
        return HttpResponseRedirect(reverse("index"))

@login_required
def following(request, username):

    user = User.objects.get(username=username)
    person_user = Follow.objects.get(person=user)
    followings = person_user.follows.all()

    following_posts = []

    for following in followings:

        username_posts = Post.objects.filter( owner=following )
        username_posts.order_by("-timestamp").all()
        following_posts.append([post.serialize() for post in username_posts])


    following_posts = reduce(lambda x,y: x+y, following_posts)
    following_posts = sorted( following_posts, key=lambda x: datetime.strptime(x['timestamp'], '%A, %d. %B %Y %I:%M%p'), reverse=True)
    
    return JsonResponse( following_posts , status=200, safe=False)
    