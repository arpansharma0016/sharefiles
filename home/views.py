from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User, auth
from django.contrib import messages
from .models import Connection
from django.views.decorators.csrf import csrf_exempt
import os
import json
import random
import time
import threading

def index(request):
    return render(request, "index.html")


def create_id(request):
    conn = Connection.objects.create(created=True)
    conn.save()
    delit(conn.id)
    return JsonResponse({'status':'success', 'id':conn.id})


def delit(id):
    try:
        conn = Connection.objects.get(id=id)
    except:
        conn = None
    if conn:
        threading.Timer(3600.0, dell, [id]).start()
        return

    else:
        return

def dell(arg):
    try:
        conn = Connection.objects.get(id=arg)
    except:
        conn = None
    if conn:
        conn.delete()
        return
    else:
        return

@csrf_exempt
def create(request):
    if request.method == "POST":
        updatedData = json.loads(request.body.decode('UTF-8'))
        offer = updatedData['offer']
        id = int(updatedData['id'])
        try:
            conn = Connection.objects.get(id=id)
        except:
            conn = None
        if conn:
            conn.offer = offer
            conn.save()
            return JsonResponse({'status':'success', 'id':conn.id})
        else:
            return JsonResponse({'status':'fail', 'message':'Bad request'})

    else:
        return JsonResponse({'status':'fail', 'message':'Bad request'})



def check_answer(request, id):
    try:
        conn = Connection.objects.get(id=id)
    except:
        conn = None

    if conn:
        if conn.offer:
            if conn.answer:
                answer = conn.answer
                conn.delete()
                return JsonResponse({'status':'success', 'found':'yes', 'answer':answer})
            
            else:
                return JsonResponse({'status':'success', 'found':'no'})

        else:
            return JsonResponse({'status':'fail', 'message':'Invalid request 1'})
        
    else:
        return JsonResponse({'status':'fail', 'message':'Invalid request 2'})


def get_offer(request, id):
    try:
        conn = Connection.objects.get(id=id)
    except:
        conn = None
    
    if conn:
        if conn.offer:
            return JsonResponse({'status':'success', 'offer':conn.offer, 'id':conn.id})

        else:
            return JsonResponse({'status':'fail', 'message':'No offer'})
    
    else:
        return JsonResponse({'status':'fail', 'message':'Connection ID not found'})



@csrf_exempt
def answer(request):
    if request.method == "POST":
        updatedData = json.loads(request.body.decode('UTF-8'))
        id = updatedData['id']
        answer = updatedData['answer']

        try:
            conn = Connection.objects.get(id=id)
        except:
            conn = None
        
        if conn:
            if conn.answer:
                return JsonResponse({'status':'fail', 'message':'This user is already occupied'})
            else:
                conn.answer = answer
                conn.save()
                return JsonResponse({'status':'success', 'id':conn.id})
        
        else:
            return JsonResponse({'status':'fail', 'message':'No user'})


    else:
        return JsonResponse({'status':'fail', 'message':'Invalid request'})