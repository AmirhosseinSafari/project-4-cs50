from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Post(models.Model):
    
    owner = models.ForeignKey("User", on_delete=models.CASCADE, related_name="post_sent")
    body = models.TextField(blank=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes_count = models.IntegerField(default=0)
    likers = models.ManyToManyField("User", related_name="post_likers", blank=True)

    def serialize(self):
        return {
            "id": self.id,
            "owner": self.owner.username,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%A, %d. %B %d/%m/%Y %I:%M%p"),
            "likes_count": self.likes_count,
            "likers": [user.username for user in self.likers.all()]
        }

    def is_liked(self, user):
        if user in self.likers:
            return "liked"
        else:
            return "unliked"

    def __str__(self):
        return f"id: {self.id}, owner: {self.owner}, time: {self.timestamp}"


class Follow(models.Model):

    person = models.ForeignKey("User", on_delete=models.CASCADE, related_name="followed")
    followers = models.ManyToManyField("User", related_name="following", blank=True)
    follows = models.ManyToManyField("User", related_name="follower", blank=True)

    def serialize(self):
        return {
            "user": self.person.username,
            "followers": [user.username for user in self.followers.all()],
            "follows": [user.username for user in self.follows.all()]
        }

    def followers_count(self):
        return len( self.followers.all() )

    def follows_count(self):
        return len( self.follows.all() )

    def __str__(self):
        return f"user: {self.person}, followers: { self.followers_count() }, follows: { self.follows_count() }"