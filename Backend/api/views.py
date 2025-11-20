from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from .models import Campanha, Usuario, Evento, Doacao, Ajuda, Instituicao, ApoioInstituicao
from .serializers import (
    CampanhaListSerializer, CampanhaDetailSerializer, 
    UsuarioSerializer, EventoSerializer, DoacaoSerializer, 
    AjudaSerializer, InstituicaoSerializer, ApoioInstituicaoSerializer
)

class CampanhaViewSet(viewsets.ModelViewSet):
    queryset = Campanha.objects.all().order_by('-data_inicio')
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    # Usa o Serializer Simples para listas, e o Completo para detalhes
    def get_serializer_class(self):
        if self.action == 'list':
            return CampanhaListSerializer
        return CampanhaDetailSerializer

    # Ação para Entrar/Sair
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def participar(self, request, pk=None):
        try:
            campanha = self.get_object()
        except Campanha.DoesNotExist:
            return Response({'status': 'Campanha não encontrada'}, status=404)
        
        user = request.user
        if user in campanha.participantes.all():
            campanha.participantes.remove(user)
            return Response({'status': 'saiu'})
        else:
            campanha.participantes.add(user)
            return Response({'status': 'entrou'})

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer

class DoacaoViewSet(viewsets.ModelViewSet):
    queryset = Doacao.objects.all()
    serializer_class = DoacaoSerializer

class AjudaViewSet(viewsets.ModelViewSet):
    queryset = Ajuda.objects.all()
    serializer_class = AjudaSerializer
    permission_classes = [IsAuthenticated]
    
    # Salva o dono do pedido automaticamente
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class InstituicaoViewSet(viewsets.ModelViewSet):
    queryset = Instituicao.objects.all()
    serializer_class = InstituicaoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class ApoioInstituicaoViewSet(viewsets.ModelViewSet):
    queryset = ApoioInstituicao.objects.all()
    serializer_class = ApoioInstituicaoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]