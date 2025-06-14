from django.contrib import admin
from .models import Phone, PhoneVariant, Accessory


admin.site.register(Phone)
admin.site.register(PhoneVariant)
admin.site.register(Accessory)
