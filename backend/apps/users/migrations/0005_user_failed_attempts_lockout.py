from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0004_user_deletion_requested_at"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="failed_login_attempts",
            field=models.IntegerField(default=0, verbose_name="intentos fallidos"),
        ),
        migrations.AddField(
            model_name="user",
            name="locked_until",
            field=models.DateTimeField(
                blank=True, null=True, verbose_name="bloqueado hasta"
            ),
        ),
    ]
