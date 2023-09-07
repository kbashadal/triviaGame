from django.urls import path
from .views import register

urlpatterns = [
    # Other URL patterns
    path('login/', register, name='register'),
]
