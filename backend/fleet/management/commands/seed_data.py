"""
Management command: seed_data
Usage:
    python manage.py seed_data          # seed with defaults
    python manage.py seed_data --flush  # wipe everything first, then seed
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from fleet.models import Truck, Driver, Job


TRUCKS = [
    {"registration_number": "TX-001-GP", "capacity": 20, "status": "Available"},
    {"registration_number": "TX-002-GP", "capacity": 30, "status": "Available"},
    {"registration_number": "TX-003-WC", "capacity": 15, "status": "Available"},
    {"registration_number": "TX-004-KZN", "capacity": 25, "status": "Maintenance"},
    {"registration_number": "TX-005-GP", "capacity": 20, "status": "Available"},
    {"registration_number": "TX-006-EC",  "capacity": 35, "status": "Available"},
    {"registration_number": "TX-007-LP",  "capacity": 18, "status": "Available"},
]

DRIVERS = [
    {"name": "James Okafor",   "license_number": "DL-2024-001", "phone_number": "+27 82 111 2233"},
    {"name": "Sipho Ndlovu",   "license_number": "DL-2024-002", "phone_number": "+27 73 444 5566"},
    {"name": "Maria Santos",   "license_number": "DL-2024-003", "phone_number": "+27 61 777 8899"},
    {"name": "David Mokoena",  "license_number": "DL-2024-004", "phone_number": "+27 83 222 3344"},
    {"name": "Fatima Patel",   "license_number": "DL-2024-005", "phone_number": "+27 72 333 4455"},
    {"name": "Andile Dlamini", "license_number": "DL-2024-006", "phone_number": "+27 64 555 6677"},
]

JOBS = [
    {
        "pickup_location":    "Johannesburg Depot, Gauteng",
        "delivery_location":  "Cape Town Warehouse, Western Cape",
        "cargo_description":  "Industrial Machinery",
        "status":             "Pending",
        "truck_reg":          "TX-001-GP",
        "driver_license":     "DL-2024-001",
    },
    {
        "pickup_location":    "Durban Port, KwaZulu-Natal",
        "delivery_location":  "Pretoria Distribution Centre, Gauteng",
        "cargo_description":  "Perishable Goods — Refrigerated",
        "status":             "In Transit",
        "truck_reg":          "TX-002-GP",
        "driver_license":     "DL-2024-002",
    },
    {
        "pickup_location":    "Port Elizabeth Terminal, Eastern Cape",
        "delivery_location":  "Bloemfontein Hub, Free State",
        "cargo_description":  "Construction Materials",
        "status":             "Completed",
        "truck_reg":          "TX-003-WC",
        "driver_license":     "DL-2024-003",
    },
    {
        "pickup_location":    "Polokwane Yard, Limpopo",
        "delivery_location":  "Nelspruit Depot, Mpumalanga",
        "cargo_description":  "Agricultural Produce",
        "status":             "Completed",
        "truck_reg":          "TX-006-EC",
        "driver_license":     "DL-2024-005",
    },
    {
        "pickup_location":    "Kimberley Depot, Northern Cape",
        "delivery_location":  "Johannesburg Warehouse, Gauteng",
        "cargo_description":  "Mining Equipment",
        "status":             "Pending",
        "truck_reg":          "TX-007-LP",
        "driver_license":     "DL-2024-006",
    },
]


class Command(BaseCommand):
    help = "Seed the database with demo trucks, drivers, jobs and a superuser for local dev."

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Delete all existing fleet data before seeding.",
        )

    def handle(self, *args, **options):
        if options["flush"]:
            self.stdout.write(self.style.WARNING("Flushing existing fleet data..."))
            Job.objects.all().delete()
            Truck.objects.all().delete()
            Driver.objects.all().delete()
            self.stdout.write(self.style.WARNING("  Fleet data cleared.\n"))

        # ── Superuser ─────────────────────────────────────────────────────────
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser(
                username="admin",
                email="admin@haulage.local",
                password="admin123",
            )
            self.stdout.write(self.style.SUCCESS("  [+] Superuser created  →  admin / admin123"))
        else:
            self.stdout.write("  [·] Superuser 'admin' already exists — skipped.")

        # ── Trucks ────────────────────────────────────────────────────────────
        truck_created = 0
        for t in TRUCKS:
            _, created = Truck.objects.get_or_create(
                registration_number=t["registration_number"],
                defaults={"capacity": t["capacity"], "status": t["status"]},
            )
            if created:
                truck_created += 1
        self.stdout.write(
            self.style.SUCCESS(f"  [+] Trucks  →  {truck_created} created  ({Truck.objects.count()} total)")
        )

        # ── Drivers ───────────────────────────────────────────────────────────
        driver_created = 0
        for d in DRIVERS:
            _, created = Driver.objects.get_or_create(
                license_number=d["license_number"],
                defaults={"name": d["name"], "phone_number": d["phone_number"]},
            )
            if created:
                driver_created += 1
        self.stdout.write(
            self.style.SUCCESS(f"  [+] Drivers →  {driver_created} created  ({Driver.objects.count()} total)")
        )

        # ── Jobs ──────────────────────────────────────────────────────────────
        job_created = 0
        for j in JOBS:
            try:
                truck  = Truck.objects.get(registration_number=j["truck_reg"])
                driver = Driver.objects.get(license_number=j["driver_license"])
            except (Truck.DoesNotExist, Driver.DoesNotExist) as e:
                self.stdout.write(self.style.ERROR(f"  [!] Skipping job — {e}"))
                continue

            # Avoid duplicating jobs on re-run (match on cargo + truck + driver)
            exists = Job.objects.filter(
                cargo_description=j["cargo_description"],
                assigned_truck=truck,
                assigned_driver=driver,
            ).exists()

            if not exists:
                Job.objects.create(
                    pickup_location=j["pickup_location"],
                    delivery_location=j["delivery_location"],
                    cargo_description=j["cargo_description"],
                    status=j["status"],
                    assigned_truck=truck,
                    assigned_driver=driver,
                )
                # Keep truck status consistent with job status
                if j["status"] == "In Transit":
                    truck.status = "In Transit"
                    truck.save()
                job_created += 1

        self.stdout.write(
            self.style.SUCCESS(f"  [+] Jobs    →  {job_created} created  ({Job.objects.count()} total)")
        )

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("✔  Seed complete!"))
        self.stdout.write("   Login at  →  http://localhost:8000/admin/")
        self.stdout.write("   API docs  →  http://localhost:8000/api/docs/")
        self.stdout.write("   Username  →  admin")
        self.stdout.write("   Password  →  admin123")
