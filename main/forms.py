#log/forms.py
from django.contrib.auth.forms import AuthenticationForm 
from django import forms
from django.contrib.auth.models import User
from django.utils.translation import ugettext_lazy as _
import re

# If you don't do this you cannot use Bootstrap CSS
class LoginForm(AuthenticationForm):
    username = forms.CharField(label="Username", max_length=30, 
                               widget=forms.TextInput(attrs={'class': 'form-control', 'name': 'username'}))
    password = forms.CharField(label="Password", max_length=30, 
                               widget=forms.PasswordInput(attrs={'class': 'form-control', 'name': 'password'}))

class RegistrationForm(forms.Form):
    #username = forms.RegexField(regex=r'^\w+$', widget=forms.TextInput(attrs=dict(required=True, max_length=30, placeholder="Username")), label=_(" "), error_messages={ 'invalid': _("This value must contain only letters, numbers and underscores.") })
    username = forms.EmailField(widget=forms.TextInput(attrs=dict(required=True, max_length=30, placeholder="Email")), label=_(" "))
    password1 = forms.CharField(widget=forms.PasswordInput(attrs=dict(required=True, max_length=30, render_value=False, placeholder="Password")), label=_(" "))
    password2 = forms.CharField(widget=forms.PasswordInput(attrs=dict(required=True, max_length=30, render_value=False, placeholder="Retype Password")), label=_(" "))
 
    def clean_username(self):
        try:
            user = User.objects.get(username__iexact=self.cleaned_data['username'])
        except User.DoesNotExist:
            return self.cleaned_data['username']
        raise forms.ValidationError(_("The email already exists. Please try another one."))
 
    def clean(self):
        if 'password1' in self.cleaned_data and 'password2' in self.cleaned_data:
            if self.cleaned_data['password1'] != self.cleaned_data['password2']:
                raise forms.ValidationError(_("The two password fields did not match."))
        return self.cleaned_data


class ItemForm(forms.Form):
    name     = forms.CharField(label="Name", max_length=30, widget=forms.TextInput(attrs={'class': 'form-control', 'name': 'name'}))
    quantity = forms.IntegerField(label="Quantity", widget=forms.TextInput(attrs={'class': 'form-control', 'name': 'quantity'}))
    user     = forms.CharField(label="User", max_length=30, widget=forms.TextInput(attrs={'class': 'form-control', 'name': 'user'}))

class CreditCardForm(forms.Form):
    # payment_method_nonce = self.cleaned_data['payment_method_nonce']
    
    def clean(self):
        result = braintree.Transaction.sale({
            "amount": grand_total_amount,
            "payment_method_nonce": payment_method_nonce,
            "options": {
                "submit_for_settlement": False
            }
        })
        if result.is_success:
            # Don't charge the customer yet - instead get the transaction                                                
            # id and use that later to complete the sale.                                                                
            self.cleaned_data['braintree_transaction_id'] = result.transaction.id
        else:
            errors = ", ".join([e.message for e in result.errors.deep_errors])
            raise forms.ValidationError(errors)