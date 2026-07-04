from apps.pets.models import Pet
from apps.centers.models import Center
c = Center.objects.first()
p = Pet.objects.create(name="TestPet", species="dog", age_months=6, size="small", gender="M", center=c, description="test")
print("Created", p.name, "(id=", p.id, ")")
print("Total pets:", Pet.objects.count())
print("Pet status:", p.status)
pets = Pet.objects.all().order_by("-created_at")
for pet in pets:
    print("  -", pet.name, "status=", pet.status, "created=", pet.created_at)
