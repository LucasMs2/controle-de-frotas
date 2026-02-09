from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OnibusViewSet, MotoristaViewSet, AlocacaoViewSet


# Criação das rotas da API com Router
router = DefaultRouter()
router.register(r'onibus', OnibusViewSet)
router.register(r'motoristas', MotoristaViewSet)
router.register(r'alocacoes', AlocacaoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]