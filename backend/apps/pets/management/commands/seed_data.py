"""
Management command to seed the database with sample data.
Usage: python manage.py seed_data
"""

import io
import urllib.request

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from PIL import Image, ImageDraw, ImageFont

from apps.centers.models import Center
from apps.pets.models import Pet, PetImage

User = get_user_model()

UNSPLASH_IMAGES = {
    "dog": [
        "https://images.unsplash.com/photo-1544568100-847a948585b9?w=800&h=800&fit=crop&q=85",
        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=800&fit=crop&q=85",
        "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=800&h=800&fit=crop&q=85",
        "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&h=800&fit=crop&q=85",
        "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800&h=800&fit=crop&q=85",
    ],
    "cat": [
        "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800&h=800&fit=crop&q=85",
        "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=800&fit=crop&q=85",
        "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=800&h=800&fit=crop&q=85",
    ],
}


def create_placeholder_image(name, species, size=800):
    """Create a placeholder image with a colored background and first letter (fallback)."""
    colors = {
        "dog": {"bg": "#2D5A3D", "fg": "#FFFFFF"},
        "cat": {"bg": "#8B5E3C", "fg": "#FFFFFF"},
    }
    color = colors.get(species, {"bg": "#6B7280", "fg": "#FFFFFF"})

    img = Image.new("RGB", (size, size), color["bg"])
    draw = ImageDraw.Draw(img)

    letter = name[0].upper()
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size // 3)
    except OSError:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), letter, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    draw.text((x, y), letter, fill=color["fg"], font=font)

    buffer = io.BytesIO()
    img.save(buffer, format="WEBP", quality=85)
    buffer.seek(0)
    return buffer


def download_image(url: str, max_size: int = 1200) -> io.BytesIO:
    """Download an image from URL and return as WebP bytes."""
    headers = {
        "User-Agent": "HuellitasBarinas/1.0 (seed-data)",
        "Accept": "image/avif,image/webp,image/jpeg,*/*",
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as response:
        img_data = response.read()

    img = Image.open(io.BytesIO(img_data))
    if img.mode in ("P", "RGBA"):
        img = img.convert("RGB")

    # Resize if needed
    if max(img.size) > max_size:
        ratio = max_size / max(img.size)
        new_size = (int(img.width * ratio), int(img.height * ratio))
        img = img.resize(new_size, Image.LANCZOS)

    buffer = io.BytesIO()
    img.save(buffer, format="WEBP", quality=85)
    buffer.seek(0)
    return buffer


class Command(BaseCommand):
    help = "Seed the database with sample centers and pets"

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        # Create superadmin if not exists
        admin, created = User.objects.get_or_create(
            username="worren",
            defaults={
                "email": "worrenalexanderbz@gmail.com",
                "first_name": "Worren",
                "last_name": "Barrios",
                "role": "superadmin",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            admin.set_password("Atreus.30707073")
            admin.save()
            self.stdout.write(self.style.SUCCESS("Created superuser: Worren Barrios"))

        # Create centers
        centers_data = [
            {
                "name": "Refugio Esperanza",
                "description": "Centro de adopcion comprometido con el bienestar de los animales en Barinas.",
                "address": "Av. Principal, Alto Barinas, Barinas",
                "phone": "+58 414-1234567",
                "email": "refugio@esperanza.com",
                "status": "active",
                "max_capacity": 50,
                "latitude": 8.623,
                "longitude": -70.210,
            },
            {
                "name": "Corazones Peludos",
                "description": "Organizacion sin fines de lucro dedicada al rescate y adopcion de mascotas.",
                "address": "Calle 5, Barinas Centro, Barinas",
                "phone": "+58 424-7654321",
                "email": "contacto@corazonespeludos.com",
                "status": "active",
                "max_capacity": 30,
                "latitude": 8.615,
                "longitude": -70.207,
            },
            {
                "name": "Patitas con Amor",
                "description": "Refugio familiar que brinda hogar a mascotas abandonadas.",
                "address": "Urb. Las Flores, Barinas",
                "phone": "+58 412-9876543",
                "email": "patitas@conamor.com",
                "status": "active",
                "max_capacity": 25,
                "latitude": 8.610,
                "longitude": -70.215,
            },
        ]

        centers = []
        for data in centers_data:
            center, _ = Center.objects.get_or_create(
                name=data["name"], defaults={**data, "created_by": admin}
            )
            centers.append(center)
            self.stdout.write(f"  Center: {center.name}")

        # Create pets
        pets_data = [
            # Dogs
            {
                "name": "Max",
                "species": "dog",
                "breed": "Mestizo",
                "age_months": 24,
                "size": "large",
                "gender": "M",
                "weight_kg": 25.0,
                "description": "Perro jugueton y carinoso. Le encanta jugar con pelotas y pasear por el parque.",
                "health_notes": "",
                "is_sterilized": True,
                "is_vaccinated": True,
                "is_dewormed": True,
                "status": "available",
                "center": centers[0],
            },
            {
                "name": "Luna",
                "species": "cat",
                "breed": "Mestiza",
                "age_months": 18,
                "size": "small",
                "gender": "F",
                "weight_kg": 4.5,
                "description": "Gata tranquila y dulce. Disfruta de los rayos del sol y las caricias.",
                "health_notes": "",
                "is_sterilized": True,
                "is_vaccinated": True,
                "is_dewormed": True,
                "status": "available",
                "center": centers[0],
            },
            {
                "name": "Toby",
                "species": "dog",
                "breed": "Labrador",
                "age_months": 36,
                "size": "large",
                "gender": "M",
                "weight_kg": 30.0,
                "description": "Perro fiel y protector. Ideal para familias con espacios amplios.",
                "health_notes": "",
                "is_sterilized": False,
                "is_vaccinated": True,
                "is_dewormed": True,
                "status": "available",
                "center": centers[0],
            },
            {
                "name": "Pelusa",
                "species": "dog",
                "breed": "Poodle Mestizo",
                "age_months": 12,
                "size": "small",
                "gender": "F",
                "weight_kg": 5.0,
                "description": "Perrita pequeña y muy dulce. Perfecta para departamentos.",
                "health_notes": "En tratamiento de vacunación",
                "is_sterilized": False,
                "is_vaccinated": False,
                "is_dewormed": False,
                "status": "available",
                "center": centers[1],
            },
            {
                "name": "Michi",
                "species": "cat",
                "breed": "Angora",
                "age_months": 8,
                "size": "small",
                "gender": "M",
                "weight_kg": 3.5,
                "description": "Gato jovencito y curioso. Le encanta explorar cada rincon de la casa.",
                "health_notes": "Vacunado parcialmente",
                "is_sterilized": False,
                "is_vaccinated": True,
                "is_dewormed": True,
                "status": "available",
                "center": centers[1],
            },
            {
                "name": "Rocky",
                "species": "dog",
                "breed": "Pastor Aleman",
                "age_months": 48,
                "size": "large",
                "gender": "M",
                "weight_kg": 35.0,
                "description": "Perro grande y noble. Muy leal y entrenado. Sabe obedecer basicos.",
                "health_notes": "",
                "is_sterilized": True,
                "is_vaccinated": True,
                "is_dewormed": True,
                "status": "available",
                "center": centers[2],
            },
            {
                "name": "Bella",
                "species": "dog",
                "breed": "Beagle",
                "age_months": 15,
                "size": "medium",
                "gender": "F",
                "weight_kg": 12.0,
                "description": "Perrita alegre y energica. Le encanta correr y jugar con otros perros.",
                "health_notes": "",
                "is_sterilized": True,
                "is_vaccinated": True,
                "is_dewormed": True,
                "status": "available",
                "center": centers[2],
            },
            {
                "name": "Nube",
                "species": "cat",
                "breed": "Persa Mestizo",
                "age_months": 24,
                "size": "medium",
                "gender": "F",
                "weight_kg": 5.5,
                "description": "Gata elegante y tranquila. Prefiere la calma y el compania constante.",
                "health_notes": "",
                "is_sterilized": True,
                "is_vaccinated": True,
                "is_dewormed": True,
                "status": "available",
                "center": centers[0],
            },
        ]

        # Index to cycle through Unsplash images per species
        dog_idx = 0
        cat_idx = 0

        for data in pets_data:
            pet, created = Pet.objects.get_or_create(
                name=data["name"], center=data["center"], defaults=data
            )

            # Create image if pet has no images
            if not pet.images.exists():
                self.stdout.write(f"  Downloading image for {pet.name}...")
                species = pet.species
                if species == "dog":
                    url = UNSPLASH_IMAGES["dog"][dog_idx % len(UNSPLASH_IMAGES["dog"])]
                    dog_idx += 1
                else:
                    url = UNSPLASH_IMAGES["cat"][cat_idx % len(UNSPLASH_IMAGES["cat"])]
                    cat_idx += 1

                try:
                    img_buffer = download_image(url)
                    pet_image = PetImage(
                        pet=pet,
                        is_primary=True,
                        order=0,
                    )
                    pet_image.image.save(
                        f"{pet.name.lower()}_real.webp", ContentFile(img_buffer.read()), save=True
                    )
                    self.stdout.write(self.style.SUCCESS(f"    Image saved for {pet.name}"))
                except Exception as e:
                    self.stdout.write(
                        self.style.WARNING(f"    Failed to download image for {pet.name}: {e}")
                    )
                    self.stdout.write("    Using fallback placeholder")
                    img_buffer = create_placeholder_image(pet.name, pet.species)
                    pet_image = PetImage(
                        pet=pet,
                        is_primary=True,
                        order=0,
                    )
                    pet_image.image.save(
                        f"{pet.name.lower()}_placeholder.webp",
                        ContentFile(img_buffer.read()),
                        save=True,
                    )

                self.stdout.write(f"  Pet: {pet.name} ({pet.get_species_display()})")
            else:
                self.stdout.write(f"  Pet: {pet.name} (already has images)")

        total_pets = Pet.objects.count()
        total_images = PetImage.objects.count()
        total_centers = Center.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone! Created {total_centers} centers, {total_pets} pets, and {total_images} images."
            )
        )
