from django.contrib import admin
from .models import Truck, Driver, Job


@admin.register(Truck)
class TruckAdmin(admin.ModelAdmin):
    list_display = ['registration_number', 'capacity', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['registration_number']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ['name', 'license_number', 'phone_number', 'created_at']
    search_fields = ['name', 'license_number']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['id', 'cargo_description', 'status', 'assigned_truck', 'assigned_driver', 'created_at']
    list_filter = ['status']
    search_fields = ['cargo_description', 'pickup_location', 'delivery_location']
    readonly_fields = ['id', 'created_at', 'updated_at']
    raw_id_fields = ['assigned_truck', 'assigned_driver']
