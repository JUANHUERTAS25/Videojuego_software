from django.db import models


class Score(models.Model):
    nickname = models.CharField(max_length=32, unique=True)
    score = models.IntegerField(default=0)
    player_id = models.CharField(max_length=64, db_index=True)
    date = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-score', 'date']

    def __str__(self):
        return f"{self.nickname} ({self.score})"
