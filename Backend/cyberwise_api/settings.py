from pathlib import Path
import os
import dj_database_url # Importante para o Render

BASE_DIR = Path(__file__).resolve().parent.parent

# SEGURANÇA: Usa a chave do ambiente no Render, ou a insegura no seu PC
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-dev-key')

# SEGURANÇA: Desliga o modo DEBUG se estiver no Render
DEBUG = 'RENDER' not in os.environ

# Configuração de Hosts (Render + Localhost)
ALLOWED_HOSTS = []
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)
ALLOWED_HOSTS.append('127.0.0.1')
ALLOWED_HOSTS.append('localhost')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'cloudinary_storage',
    'cloudinary',

    # Pacotes Externos
    'corsheaders',
    'rest_framework',
    'rest_framework.authtoken',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    
    # Nosso App
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # <--- ADICIONADO (Essencial para o CSS no Render)
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

ROOT_URLCONF = 'cyberwise_api.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'cyberwise_api.wsgi.application'

# --- BANCO DE DADOS (Lógica Híbrida) ---
# Removemos a duplicata. Agora só existe este bloco:
if 'DATABASE_URL' in os.environ:
    # Configuração para o Render (PostgreSQL)
    DATABASES = {
        'default': dj_database_url.config(
            default=os.environ.get('DATABASE_URL'),
            conn_max_age=600
        )
    }
else:
    # Configuração Local (SQLite)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# --- ARQUIVOS ESTÁTICOS (CSS) ---
STATIC_URL = 'static/'
# Esta linha corrige o erro "ImproperlyConfigured" do Render:
STATIC_ROOT = BASE_DIR / 'staticfiles'
# Esta linha faz o CSS funcionar no Render:
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# --- ARQUIVOS DE MÍDIA (Imagens) ---
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'mediafiles'

# --- CONFIGURAÇÕES DO PROJETO ---
AUTH_USER_MODEL = 'api.Usuario'
CORS_ALLOW_ALL_ORIGINS = True

# DRF
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ]
}

# AllAuth
SITE_ID = 1
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_VERIFICATION = 'none'
# IMPEDE CRASH DE EMAIL NO RENDER
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

REST_AUTH = {
    'USER_DETAILS_SERIALIZER': 'api.serializers.UsuarioSerializer',
    'REGISTER_SERIALIZER': 'api.serializers.CustomRegisterSerializer',
}

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
)

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': 'Root', 
    'API_KEY': '359775823848653', 
    'API_SECRET': 'RIoAMXAX4ZiDz9BKvpRn72Kn_Nk'
}

CLOUDINARY_STORAGE = {
    'CLOUDINARY_URL': os.environ.get('CLOUDINARY_URL')
}

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'