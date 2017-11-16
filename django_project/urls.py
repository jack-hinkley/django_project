from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required

from django.contrib import admin
from django.contrib.auth import views
from main.views import *
from main.forms import LoginForm
from main.api import UserResource
from main.api import CustomUserResource
from main.api import GroupResource
from main.api import ReceiptResource
from main.api import ItemResource
from main.api import PaymentResource
from main.api import GroceryHistoryResource
from main.api import AlcoholHistoryResource
from main.api import InvitationResource
from django.conf.urls import *
from httpproxy.views import HttpProxy

user_resource = UserResource()
customUser_resource = CustomUserResource()
group_resource = GroupResource()
# groceryList_resource = GroceryListResource()
# alcoholList_resource = AlcoholListResource()
receipt_resource = ReceiptResource()
item_resource = ItemResource()
payment_resource = PaymentResource()
groceryHistory_resource = GroceryHistoryResource()
alcoholHistory_resource = AlcoholHistoryResource()
invitation_resource = InvitationResource()

admin.autodiscover()

urlpatterns = [
    # Examples:
    # url(r'^$', 'django_project.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    # url(r'^$', views.home),
    url(r'^grocery/', grocery),
    url(r'^alcohol/', alcohol),
    url(r'^settings/', settings),
    url(r'^grocery_history/', grocery_history),
    url(r'^alcohol_history/', alcohol_history),
    url(r'^grocery_checkout/', grocery_checkout),
    url(r'^alcohol_checkout/', alcohol_checkout),
    url(r'^payment/', payment_view),
    url(r'^paymentSuccess/', payment_success),
    url(r'', include('main.urls')),
    url(r'^open_file/$', open_file),
    url(r'^GetFileName/$', GetFileName),
    url(r'^add_item/$', add_item),
    url(r'^login/$', views.login, {'template_name': 'login.html', 'authentication_form': LoginForm}),
    url(r'^logout/$', views.logout, {'next_page': '/login'}), 
    url(r'^proxy/(?P<url>.*)$', HttpProxy.as_view(base_url='http://www.python.org/')),
    url(r'^api/', include(user_resource.urls)),
    url(r'^api/', include(customUser_resource.urls)),
    url(r'^api/', include(group_resource.urls)),
    # url(r'^api/', include(groceryList_resource.urls)),
    # url(r'^api/', include(alcoholList_resource.urls)),
    url(r'^api/', include(receipt_resource.urls)),
    url(r'^api/', include(item_resource.urls)),
    url(r'^api/', include(payment_resource.urls)),
    url(r'^api/', include(groceryHistory_resource.urls)),
    url(r'^api/', include(alcoholHistory_resource.urls)),
    url(r'^api/', include(invitation_resource.urls)),
    url(r'^form_to_json/', form_to_json),

    url(r'^register/$', register), 
    url(r'^success/$', register_success), 
    
]