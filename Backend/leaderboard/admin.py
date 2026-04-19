from django.contrib import admin

from .models import Score


@admin.register(Score)
class ScoreAdmin(admin.ModelAdmin):
    list_display = ('nickname', 'score', 'player_id', 'date')
    search_fields = ('nickname', 'player_id')
    ordering = ('-score', 'date')
