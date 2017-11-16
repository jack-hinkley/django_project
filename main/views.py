from django.shortcuts import render, redirect, render_to_response
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import *
from django import forms
# Login/registration imports
from django.contrib.auth import logout, authenticate, login
from django.views.decorators.csrf import csrf_protect
from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect
# from django.http import FileResponse
from django.template import RequestContext
from .models import *
from main.forms import *

from django_project.settings import *

from wsgiref.util import FileWrapper

import os
import braintree

# Create your views here.

@login_required(login_url="/login")
def home(request):
	return render(request, 'home.html')

@login_required(login_url="/login")
def grocery(request):
	return render(request, 'grocery.html')

@login_required(login_url="/login")
def alcohol(request):
    return render(request, 'alcohol.html')

@login_required(login_url="/login")
def settings(request):
    return render(request, 'settings.html')

@login_required(login_url="/login")
def grocery_history(request):
    return render(request, 'grocery_history.html')

@login_required(login_url="/login")
def alcohol_history(request):
    return render(request, 'alcohol_history.html')

@login_required(login_url="/login")
def grocery_checkout(request):
    return render(request, 'grocery_checkout.html')

@login_required(login_url="/login")
def alcohol_checkout(request):
    return render(request, 'alcohol_checkout.html')

@login_required(login_url="/login")
def register_success(request):
    return render(request, 'success.html')

@login_required(login_url="/login")
def payment_success(request):
    return render(request, 'payment_success.html')

@csrf_protect
def add_item(request):
    if request.method == 'POST':
        form = ItemForm(request.POST)
        if form.is_valid():
            item = Item.objects.create_item(
            name=form.cleaned_data['item'],
            quantity=form.cleaned_data['quantity'],
            user=form.cleaned_data['user']
            )

            return HttpResponseRedirect('/mybasket')
    else:
        form = ItemForm()
    variables = RequestContext(request, {
    'form': form
    })
 
    return render_to_response(
    'add_item.html',
    variables,
    )

def form_to_json(form):
    result = {}
    print "Check 1"
    for name, field in form.fields.iteritems():
        print "Check 2"
        result[name] = field_to_dict(field)
    print "Check 3"
    return json.dumps(result)

@csrf_protect
def register(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = User.objects.create_user(
            username=form.cleaned_data['username'],
            password=form.cleaned_data['password1'],
            email=form.cleaned_data['username']
            )
            user = authenticate(
            	username=form.cleaned_data['username'],
                password=form.cleaned_data['password1'])
            login(request, user);
            return HttpResponseRedirect('/success')
            # return HttpResponseRedirect('/register/success')
    else:
        form = RegistrationForm()
    variables = RequestContext(request, {
    'form': form
    })
 
    return render_to_response(
    'register.html',
    variables,
    )

# braintree.Configuration.configure(braintree.Environment.Sandbox,
#     merchant_id=settings.BRAINTREE_MERCHANT_ID,
#     public_key=settings.BRAINTREE_PUBLIC_KEY,
#     private_key=settings.BRAINTREE_PRIVATE_KEY)

@login_required(login_url="/login")
def payment_view(request):
    return render(request, 'payment_template.html')

def logout_page(request):
    logout(request)
    return HttpResponseRedirect('/')

@login_required(login_url="login/")
def GetFileName(request):
    file_request = request.POST['file_name']
    file = open("temp.txt", "w")
    file.write(file_request)
    return HttpResponse()

@login_required(login_url="/login")
def open_file(request):
    # file_request = request.POST['file_name']
    file_request = "receipt-0000001.png"
    full_file = '/home/django/images/'+ file_request
    file = open(full_file, 'rb')
    response = HttpResponse(file)
    response['Content-Disposition'] = 'attachment; filename='+full_file[20:]
    response['Content-Type'] = 'image/png';
    return response


