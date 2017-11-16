from django.db import models
import uuid
from django.conf import settings
from django.db.models import Max
from django.contrib.auth.models import User
# Create your models here.
# class UserInfo(models.Model):
# 	#Primary Key Field
# 	u_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
# 	#GoogleID: Unique facebook ID per FB account
# 	google_id = models.TextField()

# 	#Basic User Fields
# 	username = models.CharField(max_length = 30, default='0', null=True)
# 	first_name = models.CharField(null=True, max_length = 30)
# 	last_name = models.CharField(null=True, max_length = 30)
# 	password = models.CharField(null= True, max_length = 18)
# 	email = models.CharField(max_length = 50,default = '0', null=True)
# 	# User Table: Username, first_name, last_name, email, password,
# 	# groups, user_permissions, is_staff, is_active, is_superuser,
# 	# last_login, date_joined
# 	g_ID = ForeignKey('Group', null = False)

	
# 	def __unicode__(self):
# 		return "Username: %s Email: %s Full Name: %s %s " % (self.username, self.email, self.first_name, self.last_name)


class CustomUser(models.Model):
	#Primary Key Field
	cu_ID = models.AutoField(primary_key = True)
	#Email Field
	email = models.CharField(max_length=50, null = False)
	tax = models.DecimalField(max_digits=10, decimal_places=2, null=True)
	#Changable Field
	# username = model.CharField(max_length=16, null=True)
	#JANK FIELD: Track name of group (s) user is in
	group_ID = models.IntegerField(null=True)
	customer_id = models.TextField(null = True)
	client_token = models.TextField(null = True)
	#Contians email of the users PayPal account
	pay_pal = models.CharField(max_length=50, null = False)
	#True is set up is complete
	setup = models.BooleanField(default=False)
	#Users contained in the group
	u_ID = models.ForeignKey(User, null=False)
	#ToMany Foreign Key to Group
	g_ID = models.ForeignKey('Group', 'g_ID', null=True)
	# related_name="groups", help_text="The groups this user is a part of"

	def __unicode__(self):
		return "cu_ID: %d User: %s Email: %s Group_ID: %s" % (self.cu_ID, self.u_ID, self.email, self.group_ID)

class Group(models.Model):
	#Primary Key Field
	g_ID = models.AutoField(primary_key = True)
	# #Tracks group for inviting new users
	# group_number = models.IntegerField(default=-1, null = False)
	#Name Field
	name = models.CharField(max_length=30, null = False)
	# #CustomUsers contained in the group
	currency = models.CharField(max_length=3, null = False, default = "CAD")
	# cu_ID = models.ForeignKey('CustomUser', 'cu_ID', null=F, related_name="customusers", help_text="The users in the group")
	# #GroceryList: References the GroceryList the item is being requested for
	# gl_ID = models.ForeignKey('GroceryList', null=True, blank=True, default = None)
	# #GroceryList: References the GroceryList the item is being requested for
	# al_ID = models.ForeignKey('AlcoholList', null=True, blank=True, default = None)

	def __unicode__(self):
		return "g_ID: %d, Name: %s" % (self.g_ID, self.name)

class Payment(models.Model):
	#Primary Key Field
	p_ID = models.AutoField(primary_key = True)
	#Amount to be paid
	amount = models.DecimalField(max_digits=10, decimal_places=2, null=True)
	#Users who the amount is owed TO
	completed = models.BooleanField(default=False)
	payer_ID = models.IntegerField(null = True)
	payee_ID = models.IntegerField(null = True)
	# payer_ID = models.ForeignKey('CustomUser', related_name='payer', null=False)
	#Users who the amount is owed TO
	# payee_ID = models.ForeignKey('CustomUser', related_name='payee',null=False)
	#Items purchased in this transaction
	# items = models.ForeignKey('Item', 'items', null=True)



class Invitation(models.Model):
	#Primary Key Field
	inv_ID = models.AutoField(primary_key = True)
	#Amount to be paid
	group_ID= models.IntegerField(null = True)
	inviter_ID = models.IntegerField(null = True)
	invitee_ID = models.IntegerField(null = True)

class Receipt(models.Model):
	#Primary Key Field
	r_ID = models.AutoField(primary_key = True)
	photo = models.TextField(null = True)
	g_ID = models.ForeignKey('Group', null=False)
	cu_ID = models.ForeignKey('CustomUser', null=False)

	def __unicode__(self):
		return "| %s | " % (self.r_ID)

# class GroceryList(models.Model):
# 	#Primary Key Field
# 	gl_ID = models.AutoField(primary_key = True)
# 	#g_ID: Access to the related Group
# 	g_ID = models.ForeignKey('Group', null=False)

# class AlcoholList(models.Model):
# 	#Primary Key Field
# 	al_ID = models.AutoField(primary_key = True)
# 	#g_ID: Access to the related Group
# 	g_ID = models.ForeignKey('Group', null=False)


class Item(models.Model):
	#Primary Key Field
	i_ID = models.AutoField(primary_key = True)
	#Name of the reuqested item
	name = models.TextField(null = False)
	#Quantity of requested item
	quantity = models.IntegerField(default=0, null = False)

	price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
	# Determines which list this item will be populated into
	# True:  Denotes grocery list
	# False: Denotes alcohol list
	listType= models.BooleanField(default=False)
	#JANK FIELD: Track which group the item belongs to.
	group_ID = models.IntegerField(null=True)
	# u_ID = models.ForeignKey('CustomUser', blank=True, null= True, default = None)
	#cu_ID: References the UserInfo table
	cu_ID = models.ForeignKey('CustomUser', blank=True, null= True, default = None)
	# Enter the ID of the payment that this item was paid for in.
	payment = models.TextField(null = True)
	# #GroceryList: References the GroceryList the item is being requested for


	# gl_ID = models.ForeignKey('GroceryList', blank=True, null= True, default = None)
	# #GroceryList: References the GroceryList the item is being requested for
	# al_ID = models.ForeignKey('AlcoholList', blank=True, null= True, default = None)

	def __unicode__(self):
		return "Name: %s Quantity: %d cu_ID: %s group_ID: %d List Type: %b" % (self.name, self.quantity, self.cu_ID, self.group_ID,self.listType)


class AlcoholHistory(models.Model):
	#Primary Key Field
	ah_ID = models.AutoField(primary_key = True)
	#Name of the reuqested item
	name = models.TextField(null = False)
	#Quantity of requested item
	quantity = models.IntegerField(default=0, null = False)
	date = models.TextField(null = False)
	price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
	#JANK FIELD: Track which group the item belongs to.
	group_ID = models.IntegerField(null=True)
	# u_ID = models.ForeignKey('CustomUser', blank=True, null= True, default = None)
	#cu_ID: References the UserInfo table
	requester = models.IntegerField(null = True)
	purchaser = models.IntegerField(null = True)
	# Enter the ID of the payment that this item was paid for in.
	payment = models.TextField(null = True)
	total =  models.DecimalField(max_digits=10, decimal_places=2, null=True)

	def __unicode__(self):
		return ""

class GroceryHistory(models.Model):
	#Primary Key Field
	gh_ID = models.AutoField(primary_key = True)
	#Name of the reuqested item
	name = models.TextField(null = False)
	#Quantity of requested item
	quantity = models.IntegerField(default=0, null = False)
	date = models.TextField(null = False)
	price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
	#JANK FIELD: Track which group the item belongs to.
	group_ID = models.IntegerField(null=True)
	requester = models.IntegerField(null = True)
	purchaser = models.IntegerField(null = True)
	# Enter the ID of the payment that this item was paid for in.
	payment = models.TextField(null = True)
	total =  models.DecimalField(max_digits=10, decimal_places=2, null=True)

	def __unicode__(self):
		return ""