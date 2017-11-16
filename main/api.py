from tastypie.resources import ModelResource
from tastypie.authorization import Authorization
from tastypie.authentication import ApiKeyAuthentication
from tastypie import fields
from tastypie.resources import ALL, ALL_WITH_RELATIONS
from django.contrib.auth.models import User
from tastypie.fields import ForeignKey

from .models import CustomUser, Group, Item, Receipt, Payment, AlcoholHistory, GroceryHistory, Invitation
# , GroceryList,  AlcoholList

# class ExpenseAuthorization(Authorization):

#     def read_list(self, object_list, bundle):
#         return object_list.filter(user=bundle.request.user)

#     def read_detail(self, object_list,bundle):
#     	obj = object_list[0]
#     	return obj.user == bundle.request.user

#     def create_detail(self, object_list, bundle):
# 	    user = bundle.request.user
# 	    # Return True if current user is Sheryl else return False
# 	    return user.username == "sheryl"

# Define What info to be shown the Address Resource is Queried
# class AddressResource(ModelResource):

#     class Meta:
#         queryset = Address.objects.all()
#         resource_name = 'address'
#         fields = ['a_ID','street_address', 'city', 'country', 'province', 'postal_code', 'longitude','latitude', 'user_id']
#         filtering = {
#             'a_ID': ALL,
#             'longitude': ALL_WITH_RELATIONS,
#             'latitude' : ALL_WITH_RELATIONS,
#             'user_id': ALL_WITH_RELATIONS
#         }
#         authorization = Authorization()


class UserResource(ModelResource):
    
	class Meta:
		queryset = User.objects.all()
		resource_name = 'user'
		fields = ['email']
        filtering = {
            'email': ALL_WITH_RELATIONS
        }
        
        authorization = Authorization()

# class UserInfoResource(ModelResource):

#     class Meta:
#         queryset = UserInfo.objects.all()
#         resource_name = 'userInfo'
#         fields = ['u_id','avatar', 'phone_id', 'fb_id', 'real_photo_id' ,'birthday', 'email', 'username', 'role', 'first_name', 'last_name', 'password', 'balance', 'phone_number', 'user_registered']
#         filtering = {
#             'u_id' : ALL_WITH_RELATIONS,
#             'email': ALL_WITH_RELATIONS,
#             'username' : ALL_WITH_RELATIONS,
#             'fb_id' : ALL_WITH_RELATIONS
#         }
#         authorization = Authorization()
#         # authentication = ApiKeyAuthentication()

class CustomUserResource(ModelResource):
    u_ID = fields.ForeignKey(UserResource, 'u_ID', full= True, blank=True, null=True)
    g_ID = fields.ForeignKey('main.api.GroupResource','g_ID', full=True, blank=True, null=True)
    # payer = fields.ForeignKey('main.api.CustomUserResource','payer', related_name = 'payer_ID', full=True, blank=True, null=True)
    # payee = fields.ForeignKey('main.api.CustomUserResource','payee', related_name = 'payee_ID',full=True, blank=True, null=True)
    # groups = fields.ManyToManyField('main.api.GroupResource', 'groups', full= True, related_name="customusers", blank=True, null=True)
    

    class Meta:
        queryset = CustomUser.objects.all()
        resource_name = 'customUser'
        exclude = []
        filtering = {
            'cu_ID': ALL_WITH_RELATIONS,
            'group_ID' : ALL_WITH_RELATIONS,
            'email': ALL_WITH_RELATIONS,
            'groups': ALL_WITH_RELATIONS
        }

        authorization = Authorization()

        def dehydrate(self, bundle):
            if bundle.request.method == 'POST':
                bundle.data['my_custom_data'] = 'my_data'

            return bundle

class PaymentResource(ModelResource):
    # payer_ID = fields.ForeignKey('main.api.CustomUserResource','payer_ID',full=True, blank=True, null=True)
    # payee_ID = fields.ForeignKey('main.api.CustomUserResource','payee_ID', full=True, blank=True, null=True)
    # items = fields.ForeignKey('main.api.ItemResource','items', full=True, blank=True, null=True)
    # related_name = 'payee'
    # , related_name = 'payer'
    class Meta:
        queryset = Payment.objects.all()
        resource_name = 'payment'
        exclude = []
        # fields = ['g_ID', 'group_number', 'name', 'cu_IDs', 'gl_ID', 'al_ID']
        filtering = {
            'p_ID': ALL_WITH_RELATIONS,
            'payer_ID': ALL_WITH_RELATIONS,
            'payee_ID': ALL_WITH_RELATIONS,
            'items': ALL_WITH_RELATIONS,
            'completed': ALL_WITH_RELATIONS
        }

        authorization = Authorization()

        def dehydrate(self, bundle):
            if bundle.request.method == 'POST':
                bundle.data['my_custom_data'] = 'my_data'

            return bundle

class GroupResource(ModelResource):
    # gl_ID = fields.ForeignKey('main.api.GroceryResource','gl_ID', full=True, related_name="g_ID", blank=True, null=True)
    # al_ID = fields.ForeignKey('main.api.AlcoholResource','al_ID', full=True, related_name="g_ID", blank=True, null=True)
    # customusers = fields.ManyToManyField(CustomUserResource, 'customusers', related_name="groups", full= True, null=True)
    # cutomusers = fields.ForeignKey(attribute='customuser_set','customeusers', readonly=True)
    
    class Meta:
        queryset = Group.objects.all()
        resource_name = 'group'
        exclude = []
        # fields = ['g_ID', 'group_number', 'name', 'cu_IDs', 'gl_ID', 'al_ID']
        filtering = {
            'g_ID': ALL_WITH_RELATIONS
        }

        authorization = Authorization()

        def dehydrate(self, bundle):
            if bundle.request.method == 'POST':
                bundle.data['cust_g_ID'] = 'g_ID'

            return bundle

   


# class GroceryListResource(ModelResource):
#     g_ID = fields.ForeignKey(GroupResource,'g_ID', full=True)

#     class Meta:
#         queryset = GroceryList.objects.all()
#         resource_name = 'groceryList'
#         fields = ['gl_ID','g_ID']
        
#         filtering = {
#             'gl_ID': ALL_WITH_RELATIONS,
#             'g_ID': ALL_WITH_RELATIONS
#         }
#         authorization = Authorization()

# class AlcoholListResource(ModelResource):
#     g_ID = fields.ForeignKey(GroupResource,'g_ID', full=True)

#     class Meta:
#         queryset = AlcoholList.objects.all()
#         resource_name = 'alcoholList'
#         fields = ['al_ID','g_ID']
        
#         filtering = {
#             'al_ID': ALL_WITH_RELATIONS,
#             'g_ID': ALL_WITH_RELATIONS
#         }
#         authorization = Authorization()


class ReceiptResource(ModelResource):
    cu_ID = fields.ForeignKey(CustomUserResource,'cu_ID', full=True)
    g_ID = fields.ForeignKey(GroupResource, 'g_ID', full=True)

    class Meta:
        queryset = Receipt.objects.all()
        resource_name = 'receipt'
        fields = ['r_ID','photo','g_ID','cu_ID']
        
        filtering = {
            'cu_ID': ALL_WITH_RELATIONS,
            'g_ID': ALL_WITH_RELATIONS

        }
        authorization = Authorization()

        def dehydrate(self, bundle):
            if bundle.request.method == 'POST':
                bundle.data['my_custom_data'] = 'my_data'

            return bundle

class ItemResource(ModelResource):
    cu_ID = fields.ForeignKey(CustomUserResource,'cu_ID',full=True, blank=True, null=True)


    class Meta:
        queryset = Item.objects.all()
        resource_name = 'item'
        # fields = ['i_ID','name','quantity', 'cu_ID', 'listType', 'group_ID']
        exclude = []

        filtering = {
            'i_ID': ALL_WITH_RELATIONS,
            'cu_ID': ALL_WITH_RELATIONS,
            'listType': ALL_WITH_RELATIONS,
            'group_ID': ALL_WITH_RELATIONS,
            'groups': ALL_WITH_RELATIONS

        }
        authorization = Authorization()

        def dehydrate(self, bundle):
            if bundle.request.method == 'POST':
                bundle.data['my_custom_data'] = 'my_data'

            return bundle
    # def hydrate(self, bundle):
       #  bundle.obj.user = bundle.request.user
       #  return bundle

class AlcoholHistoryResource(ModelResource):
    


    class Meta:
        queryset = AlcoholHistory.objects.all()
        resource_name = 'alcoholHistory'
        # fields = ['ih_ID','name','quantity', 'cu_ID', 'listType', 'group_ID']
        exclude = []

        filtering = {
            'ah_ID': ALL_WITH_RELATIONS,
            'requestor': ALL_WITH_RELATIONS,
            'purchaser': ALL_WITH_RELATIONS,
            'group_ID': ALL_WITH_RELATIONS

        }
        authorization = Authorization()

        def dehydrate(self, bundle):
            if bundle.request.method == 'POST':
                bundle.data['my_custom_data'] = 'my_data'

            return bundle

class GroceryHistoryResource(ModelResource):


    class Meta:
        queryset = GroceryHistory.objects.all()
        resource_name = 'groceryHistory'
        # fields = ['ih_ID','name','quantity', 'cu_ID', 'listType', 'group_ID']
        exclude = []

        filtering = {
            'gh_ID': ALL_WITH_RELATIONS,
            'requestor': ALL_WITH_RELATIONS,
            'purchaser': ALL_WITH_RELATIONS,
            'group_ID': ALL_WITH_RELATIONS

        }
        authorization = Authorization()

        def dehydrate(self, bundle):
            if bundle.request.method == 'POST':
                bundle.data['my_custom_data'] = 'my_data'

            return bundle

class InvitationResource(ModelResource):
    

    class Meta:
        queryset = Invitation.objects.all()
        resource_name = 'invitation'
        # fields = ['ih_ID','name','quantity', 'cu_ID', 'listType', 'group_ID']
        exclude = []
        
        filtering = {
            'inv_ID': ALL_WITH_RELATIONS,
            'group_ID': ALL_WITH_RELATIONS,
            'inviter_ID': ALL_WITH_RELATIONS,
            'invitee_ID': ALL_WITH_RELATIONS

        }
        authorization = Authorization()

        def dehydrate(self, bundle):
            if bundle.request.method == 'POST':
                bundle.data['my_custom_data'] = 'my_data'

            return bundle           