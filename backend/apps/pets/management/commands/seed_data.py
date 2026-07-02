"""
Management command to seed the database with sample data.
Usage: python manage.py seed_data
"""

import io
from PIL import Image, ImageDraw, ImageFont
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from apps.centers.models import Center
from apps.pets.models import Pet, PetImage

User = get_user_model()


def create_placeholder_image(name, species, size=800):
    """Create a placeholder image with a colored background and first letter."""
    colors = {
        'dog': {'bg': '#2D5A3D', 'fg': '#FFFFFF'},
        'cat': {'bg': '#8B5E3C', 'fg': '#FFFFFF'},
    }
    color = colors.get(species, {'bg': '#6B7280', 'fg': '#FFFFFF'})
    
    img = Image.new('RGB', (size, size), color['bg'])
    draw = ImageDraw.Draw(img)
    
    # Draw first letter
    letter = name[0].upper()
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size // 3)
    except (OSError, IOError):
        font = ImageFont.load_default()
    
    bbox = draw.textbbox((0, 0), letter, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    draw.text((x, y), letter, fill=color['fg'], font=font)
    
    # Save as WebP directly (skip conversion signal)
    buffer = io.BytesIO()
    img.save(buffer, format='WEBP', quality=85)
    buffer.seek(0)
    return buffer


class Command(BaseCommand):
    help = 'Seed the database with sample centers and pets'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # Create superadmin if not exists
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@huellitas.com',
                'first_name': 'Admin',
                'last_name': 'General',
                'role': 'superadmin',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(self.style.SUCCESS('Created admin user'))

        # Create centers
        centers_data = [
            {
                'name': 'Refugio Esperanza',
                'description': 'Centro de adopcion comprometido con el bienestar de los animales en Barinas.',
                'address': 'Av. Principal, Alto Barinas, Barinas',
                'phone': '+58 414-1234567',
                'email': 'refugio@esperanza.com',
                'status': 'active',
                'max_capacity': 50,
            },
            {
                'name': 'Corazones Peludos',
                'description': 'Organizacion sin fines de lucro dedicada al rescate y adopcion de mascotas.',
                'address': 'Calle 5, Barinas Centro, Barinas',
                'phone': '+58 424-7654321',
                'email': 'contacto@corazonespeludos.com',
                'status': 'active',
                'max_capacity': 30,
            },
            {
                'name': 'Patitas con Amor',
                'description': 'Refugio familiar que brinda hogar a mascotas abandonadas.',
                'address': 'Urb. Las Flores, Barinas',
                'phone': '+58 412-9876543',
                'email': 'patitas@conamor.com',
                'status': 'active',
                'max_capacity': 25,
            },
        ]

        centers = []
        for data in centers_data:
            center, _ = Center.objects.get_or_create(
                name=data['name'],
                defaults={**data, 'created_by': admin}
            )
            centers.append(center)
            self.stdout.write(f'  Center: {center.name}')

        # Create pets
        pets_data = [
            # Dogs
            {
                'name': 'Max',
                'species': 'dog',
                'breed': 'Mestizo',
                'age_months': 24,
                'size': 'large',
                'gender': 'M',
                'weight_kg': 25.0,
                'description': 'Perro jugueton y carinoso. Le encanta jugar con pelotas y pasear por el parque.',
                'health_status': 'Vacunado y esterilizado',
                'is_sterilized': True,
                'is_vaccinated': True,
                'status': 'available',
                'center': centers[0],
            },
            {
                'name': 'Luna',
                'species': 'cat',
                'breed': 'Mestiza',
                'age_months': 18,
                'size': 'small',
                'gender': 'F',
                'weight_kg': 4.5,
                'description': 'Gata tranquila y dulce. Disfruta de los rayos del sol y las caricias.',
                'health_status': 'Vacunada y esterilizada',
                'is_sterilized': True,
                'is_vaccinated': True,
                'status': 'available',
                'center': centers[0],
            },
            {
                'name': 'Toby',
                'species': 'dog',
                'breed': 'Labrador',
                'age_months': 36,
                'size': 'large',
                'gender': 'M',
                'weight_kg': 30.0,
                'description': 'Perro fiel y protector. Ideal para familias con espacios amplios.',
                'health_status': 'Vacunado',
                'is_sterilized': False,
                'is_vaccinated': True,
                'status': 'available',
                'center': centers[0],
            },
            {
                'name': 'Pelusa',
                'species': 'dog',
                'breed': 'Poodle Mestizo',
                'age_months': 12,
                'size': 'small',
                'gender': 'F',
                'weight_kg': 5.0,
                'description': 'Perrita pequeña y muy dulce. Perfecta para departamentos.',
                'health_status': 'En tratamiento de vacunacion',
                'is_sterilized': False,
                'is_vaccinated': False,
                'status': 'available',
                'center': centers[1],
            },
            {
                'name': 'Michi',
                'species': 'cat',
                'breed': 'Angora',
                'age_months': 8,
                'size': 'small',
                'gender': 'M',
                'weight_kg': 3.5,
                'description': 'Gato jovencito y curioso. Le encanta explorar cada rincon de la casa.',
                'health_status': 'Vacunado parcialmente',
                'is_sterilized': False,
                'is_vaccinated': True,
                'status': 'available',
                'center': centers[1],
            },
            {
                'name': 'Rocky',
                'species': 'dog',
                'breed': 'Pastor Aleman',
                'age_months': 48,
                'size': 'large',
                'gender': 'M',
                'weight_kg': 35.0,
                'description': 'Perro grande y noble. Muy leal y entrenado. Sabe obedecer basicos.',
                'health_status': 'Totalmente vacunado y esterilizado',
                'is_sterilized': True,
                'is_vaccinated': True,
                'status': 'available',
                'center': centers[2],
            },
            {
                'name': 'Bella',
                'species': 'dog',
                'breed': 'Beagle',
                'age_months': 15,
                'size': 'medium',
                'gender': 'F',
                'weight_kg': 12.0,
                'description': 'Perrita alegre y energica. Le encanta correr y jugar con otros perros.',
                'health_status': 'Vacunada y desparasitada',
                'is_sterilized': True,
                'is_vaccinated': True,
                'status': 'available',
                'center': centers[2],
            },
            {
                'name': 'Nube',
                'species': 'cat',
                'breed': 'Persa Mestizo',
                'age_months': 24,
                'size': 'medium',
                'gender': 'F',
                'weight_kg': 5.5,
                'description': 'Gata elegante y tranquila. Prefiere la calma y el compania constante.',
                'health_status': 'Sana y esterilizada',
                'is_sterilized': True,
                'is_vaccinated': True,
                'status': 'available',
                'center': centers[0],
            },
        ]

        for data in pets_data:
            pet, created = Pet.objects.get_or_create(
                name=data['name'],
                center=data['center'],
                defaults=data
            )
            
            # Create placeholder image if pet has no images
            if not pet.images.exists():
                img_buffer = create_placeholder_image(pet.name, pet.species)
                pet_image = PetImage(
                    pet=pet,
                    is_primary=True,
                    order=0,
                )
                # Save directly with .webp extension to skip signal conversion
                pet_image.image.save(
                    f'{pet.name.lower()}_placeholder.webp',
                    ContentFile(img_buffer.read()),
                    save=True
                )
                self.stdout.write(f'  Pet: {pet.name} ({pet.get_species_display()})')
            else:
                self.stdout.write(f'  Pet: {pet.name} (already has images)')

        total_pets = Pet.objects.count()
        total_images = PetImage.objects.count()
        total_centers = Center.objects.count()
        self.stdout.write(self.style.SUCCESS(
            f'\nDone! Created {total_centers} centers, {total_pets} pets, and {total_images} images.'
        ))
