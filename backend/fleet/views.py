import logging
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db import transaction
from django.db.models import Q
from .models import Truck, Driver, Job
from .serializers import TruckSerializer, DriverSerializer, JobSerializer
from .pagination import StandardPagination

logger = logging.getLogger(__name__)


# ─── Truck ────────────────────────────────────────────────────────────────────

class TruckViewSet(viewsets.ModelViewSet):
    queryset = Truck.objects.all()
    serializer_class = TruckSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        qs = Truck.objects.all()
        search = self.request.query_params.get('search')
        status_filter = self.request.query_params.get('status')
        if search:
            qs = qs.filter(registration_number__icontains=search)
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    @staticmethod
    def _camel(truck):
        return {
            "id": str(truck.id),
            "registrationNumber": truck.registration_number,
            "capacity": truck.capacity,
            "status": truck.status,
            "createdAt": truck.created_at.isoformat(),
        }

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response([self._camel(t) for t in page])
        return Response({"items": [self._camel(t) for t in qs], "total": qs.count()})

    def retrieve(self, request, *args, **kwargs):
        return Response(self._camel(self.get_object()))

    def create(self, request, *args, **kwargs):
        data = request.data
        serializer = self.get_serializer(data={
            "registration_number": data.get("registrationNumber") or data.get("registration_number"),
            "capacity": data.get("capacity"),
            "status": data.get("status", "Available"),
        })
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        logger.info(f"Truck created: {instance.registration_number}")
        return Response(self._camel(instance), status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        if "registrationNumber" in data:
            instance.registration_number = data["registrationNumber"]
        if "registration_number" in data:
            instance.registration_number = data["registration_number"]
        if "capacity" in data:
            instance.capacity = data["capacity"]
        if "status" in data:
            instance.status = data["status"]
        instance.save()
        return Response(self._camel(instance))

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        active_jobs = Job.objects.filter(
            assigned_truck=instance, status__in=['Pending', 'In Transit']
        )
        if active_jobs.exists():
            return Response(
                {"error": f"Cannot delete '{instance.registration_number}' — it has active jobs."},
                status=status.HTTP_409_CONFLICT
            )
        instance.delete()
        logger.info(f"Truck deleted: {instance.registration_number}")
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Driver ───────────────────────────────────────────────────────────────────

class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        qs = Driver.objects.all()
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(license_number__icontains=search) |
                Q(phone_number__icontains=search)
            )
        return qs

    @staticmethod
    def _camel(driver):
        return {
            "id": str(driver.id),
            "name": driver.name,
            "licenseNumber": driver.license_number,
            "phoneNumber": driver.phone_number,
            "createdAt": driver.created_at.isoformat(),
        }

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response([self._camel(d) for d in page])
        return Response({"items": [self._camel(d) for d in qs], "total": qs.count()})

    def retrieve(self, request, *args, **kwargs):
        return Response(self._camel(self.get_object()))

    def create(self, request, *args, **kwargs):
        data = request.data
        serializer = self.get_serializer(data={
            "name": data.get("name"),
            "license_number": data.get("licenseNumber") or data.get("license_number"),
            "phone_number": data.get("phoneNumber") or data.get("phone_number"),
        })
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        logger.info(f"Driver created: {instance.name}")
        return Response(self._camel(instance), status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        if "name" in data:
            instance.name = data["name"]
        if "licenseNumber" in data:
            instance.license_number = data["licenseNumber"]
        if "license_number" in data:
            instance.license_number = data["license_number"]
        if "phoneNumber" in data:
            instance.phone_number = data["phoneNumber"]
        if "phone_number" in data:
            instance.phone_number = data["phone_number"]
        instance.save()
        return Response(self._camel(instance))

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        active = Job.objects.filter(
            assigned_driver=instance, status__in=['Pending', 'In Transit']
        )
        if active.exists():
            return Response(
                {"error": f"Cannot delete driver '{instance.name}' — they have active jobs."},
                status=status.HTTP_409_CONFLICT
            )
        instance.delete()
        logger.info(f"Driver deleted: {instance.name}")
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Job ──────────────────────────────────────────────────────────────────────

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        qs = Job.objects.select_related('assigned_truck', 'assigned_driver').all()
        search = self.request.query_params.get('search')
        status_filter = self.request.query_params.get('status')
        if search:
            qs = qs.filter(
                Q(cargo_description__icontains=search) |
                Q(pickup_location__icontains=search) |
                Q(delivery_location__icontains=search)
            )
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    @staticmethod
    def _camel(job):
        return {
            "id": str(job.id),
            "pickupLocation": job.pickup_location,
            "deliveryLocation": job.delivery_location,
            "cargoDescription": job.cargo_description,
            "status": job.status,
            "assignedTruckId": str(job.assigned_truck_id) if job.assigned_truck_id else None,
            "assignedDriverId": str(job.assigned_driver_id) if job.assigned_driver_id else None,
            "createdAt": job.created_at.isoformat(),
        }

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response([self._camel(j) for j in page])
        return Response({"items": [self._camel(j) for j in qs], "total": qs.count()})

    def retrieve(self, request, *args, **kwargs):
        return Response(self._camel(self.get_object()))

    def create(self, request, *args, **kwargs):
        data = request.data
        truck_id = data.get('truckId') or data.get('assigned_truck')
        driver_id = data.get('driverId') or data.get('assigned_driver')

        if not truck_id:
            return Response({"error": "A truck must be assigned."}, status=status.HTTP_400_BAD_REQUEST)
        if not driver_id:
            return Response({"error": "A driver must be assigned."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            truck = Truck.objects.get(id=truck_id)
        except Truck.DoesNotExist:
            return Response({"error": "Truck not found."}, status=status.HTTP_404_NOT_FOUND)

        if truck.status != 'Available':
            return Response(
                {"error": f"Truck {truck.registration_number} is {truck.status} and cannot be assigned."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            driver = Driver.objects.get(id=driver_id)
        except Driver.DoesNotExist:
            return Response({"error": "Driver not found."}, status=status.HTTP_404_NOT_FOUND)

        active_driver_jobs = Job.objects.filter(
            assigned_driver=driver, status__in=['Pending', 'In Transit']
        )
        if active_driver_jobs.exists():
            return Response(
                {"error": f"Driver {driver.name} already has an active job."},
                status=status.HTTP_400_BAD_REQUEST
            )

        job = Job.objects.create(
            pickup_location=data.get('pickupLocation', ''),
            delivery_location=data.get('deliveryLocation', ''),
            cargo_description=data.get('cargoDescription', ''),
            assigned_truck=truck,
            assigned_driver=driver,
        )
        logger.info(f"Job {job.id} created: {job.cargo_description}")
        return Response(self._camel(job), status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        job = self.get_object()
        data = request.data
        truck_id = data.get('truckId') or data.get('assigned_truck')
        driver_id = data.get('driverId') or data.get('assigned_driver')

        if truck_id and str(truck_id) != str(job.assigned_truck_id):
            try:
                truck = Truck.objects.get(id=truck_id)
            except Truck.DoesNotExist:
                return Response({"error": "Truck not found."}, status=status.HTTP_404_NOT_FOUND)
            if truck.status != 'Available':
                return Response(
                    {"error": f"Truck {truck.registration_number} is not available."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            job.assigned_truck = truck

        if driver_id and str(driver_id) != str(job.assigned_driver_id):
            try:
                driver = Driver.objects.get(id=driver_id)
            except Driver.DoesNotExist:
                return Response({"error": "Driver not found."}, status=status.HTTP_404_NOT_FOUND)
            active = Job.objects.filter(
                assigned_driver=driver, status__in=['Pending', 'In Transit']
            ).exclude(id=job.id)
            if active.exists():
                return Response(
                    {"error": f"Driver {driver.name} already has an active job."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            job.assigned_driver = driver

        if 'pickupLocation' in data:
            job.pickup_location = data['pickupLocation']
        if 'deliveryLocation' in data:
            job.delivery_location = data['deliveryLocation']
        if 'cargoDescription' in data:
            job.cargo_description = data['cargoDescription']

        job.save()
        logger.info(f"Job {job.id} updated")
        return Response(self._camel(job))

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        logger.info(f"Job {instance.id} deleted")
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['patch'], url_path='status')
    @transaction.atomic
    def update_status(self, request, pk=None):
        job = self.get_object()
        new_status = request.data.get('status')
        valid = ['Pending', 'In Transit', 'Completed']

        if new_status not in valid:
            return Response(
                {"error": f"Invalid status. Must be one of: {valid}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = job.status
        job.status = new_status
        job.save()

        if job.assigned_truck:
            truck = job.assigned_truck
            if new_status == 'In Transit':
                truck.status = 'In Transit'
            elif new_status == 'Completed':
                truck.status = 'Available'
            truck.save()
            logger.info(f"Truck {truck.registration_number} → {truck.status}")

        logger.info(f"Job {job.id}: {old_status} → {new_status}")
        return Response({"success": True, "status": job.status, "id": str(job.id)})

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        return Response({
            "totalTrucks": Truck.objects.count(),
            "availableTrucks": Truck.objects.filter(status='Available').count(),
            "totalDrivers": Driver.objects.count(),
            "activeJobs": Job.objects.filter(status__in=['Pending', 'In Transit']).count(),
            "completedJobs": Job.objects.filter(status='Completed').count(),
        })


# ─── Auth ─────────────────────────────────────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not username or not password:
            return Response(
                {"error": "Username and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if len(password) < 6:
            return Response(
                {"error": "Password must be at least 6 characters."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Username already taken."},
                status=status.HTTP_409_CONFLICT
            )

        User.objects.create_user(username=username, password=password)
        logger.info(f"New user registered: {username}")
        return Response({"message": "Registration successful."}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '')
        password = request.data.get('password', '')
        user = authenticate(username=username, password=password)

        if not user:
            return Response(
                {"error": "Invalid username or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)
        refresh['username'] = user.username
        refresh['role'] = 'dispatcher'
        refresh['id'] = str(user.id)

        logger.info(f"User logged in: {username}")
        return Response({
            "token": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": str(user.id),
                "username": user.username,
                "role": "dispatcher",
            }
        })
