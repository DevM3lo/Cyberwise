from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CampanhaViewSet, UsuarioViewSet, EventoViewSet, DoacaoViewSet, 
    AjudaViewSet, InstituicaoViewSet, ApoioInstituicaoViewSet, DepoimentoViewSet
)

router = DefaultRouter()
router.register(r'campanhas', CampanhaViewSet)
router.register(r'usuarios', UsuarioViewSet)
router.register(r'eventos', EventoViewSet)
router.register(r'doacoes', DoacaoViewSet)
router.register(r'ajuda', AjudaViewSet)
router.register(r'instituicoes', InstituicaoViewSet)
router.register(r'apoios', ApoioInstituicaoViewSet)
router.register(r'depoimentos', DepoimentoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]