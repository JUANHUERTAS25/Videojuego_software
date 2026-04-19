from django.urls import path

from .views import save_score, top5_scores

urlpatterns = [
    path('save/', save_score, name='save_score'),
    path('top5/', top5_scores, name='top5_scores'),
]
