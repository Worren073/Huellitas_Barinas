"""
User serializers for the API.
"""
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""

    full_name = serializers.SerializerMethodField()
    country_display = serializers.CharField(source="get_country_display", read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "country",
            "country_display",
            "phone",
            "address",
            "avatar",
            "is_verified",
            "center",
            "date_joined",
        )
        read_only_fields = ("id", "date_joined", "is_verified", "phone", "country", "address")

    def get_full_name(self, obj):
        return obj.get_full_name()


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating users."""

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "country",
            "phone",
            "address",
        )

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Las contraseñas no coinciden."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserListSerializer(serializers.ModelSerializer):
    """Serializer for listing users."""

    center_name = serializers.CharField(source="center.name", read_only=True, default="")
    country_display = serializers.CharField(source="get_country_display", read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "country",
            "country_display",
            "phone",
            "is_active",
            "is_verified",
            "center",
            "center_name",
            "date_joined",
        )


class UserUpdateRoleSerializer(serializers.ModelSerializer):
    """Serializer for updating user role (SuperAdmin only)."""

    ROLE_CHOICES = [
        ("superadmin", "Súper Administrador"),
        ("center_admin", "Administrador de Centro"),
        ("voluntario", "Voluntario"),
        ("adoptante", "Adoptante"),
    ]
    role = serializers.ChoiceField(choices=ROLE_CHOICES)
    country = serializers.ChoiceField(choices=User.Country.choices, required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ("id", "role", "center", "phone", "country", "address")


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password."""

    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("La contraseña actual es incorrecta.")
        return value


class LoginSerializer(serializers.Serializer):
    """Serializer for login."""

    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
