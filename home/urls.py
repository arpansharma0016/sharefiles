from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('create_id', views.create_id, name="create_id"),
    path('create', views.create, name="create"),
    path('check_answer-<int:id>', views.check_answer, name="check_answer"),
    path('get_offer-<int:id>', views.get_offer, name="get_offer"),
    path('answer', views.answer, name="answer"),
]
