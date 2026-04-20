from rest_framework import serializers
from .models import Truck, Driver, Job


class TruckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Truck
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class JobSerializer(serializers.ModelSerializer):
    # Read-only nested representations
    assigned_truck_details = TruckSerializer(source='assigned_truck', read_only=True)
    assigned_driver_details = DriverSerializer(source='assigned_driver', read_only=True)

    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_representation(self, instance):
        """Add camelCase aliases consumed by the React frontend."""
        data = super().to_representation(instance)
        data['assignedTruckId'] = str(instance.assigned_truck_id) if instance.assigned_truck_id else None
        data['assignedDriverId'] = str(instance.assigned_driver_id) if instance.assigned_driver_id else None
        data['pickupLocation'] = data.pop('pickup_location', data.get('pickupLocation'))
        data['deliveryLocation'] = data.pop('delivery_location', data.get('deliveryLocation'))
        data['cargoDescription'] = data.pop('cargo_description', data.get('cargoDescription'))
        data['createdAt'] = data.pop('created_at', data.get('createdAt'))
        return data
