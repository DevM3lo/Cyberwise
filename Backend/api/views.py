# No arquivo: backend/api/views.py

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from .models import Campanha, Usuario, Evento, Doacao, Ajuda, Instituicao, ApoioInstituicao, Comentario, Depoimento
from .serializers import (
    CampanhaListSerializer, CampanhaDetailSerializer, 
    UsuarioSerializer, EventoSerializer, DoacaoSerializer, 
    AjudaSerializer, InstituicaoSerializer, ApoioInstituicaoSerializer,
    ComentarioSerializer, DepoimentoSerializer
)

class CampanhaViewSet(viewsets.ModelViewSet):
    queryset = Campanha.objects.all().order_by('-data_inicio')
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'list' or self.action == 'minhas': # Usa o simples para 'minhas' também
            return CampanhaListSerializer
        return CampanhaDetailSerializer

    # --- NOVA AÇÃO: MINHAS CAMPANHAS ---
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def minhas(self, request):
        # Filtra campanhas onde o ID do usuário está na lista de participantes
        user = request.user
        campanhas = Campanha.objects.filter(participantes=user)
        serializer = self.get_serializer(campanhas, many=True)
        return Response(serializer.data)

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
    
    # --- NOVA AÇÃO: COMENTAR ---
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def comentar(self, request, pk=None):
        campanha = self.get_object()
        texto = request.data.get('texto')
        
        if not texto:
            return Response({'detail': 'Texto é obrigatório.'}, status=400)

        Comentario.objects.create(
            campanha=campanha,
            usuario=request.user,
            texto=texto
        )
        return Response({'status': 'Comentário adicionado!'})

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer

class DoacaoViewSet(viewsets.ModelViewSet):
    queryset = Doacao.objects.all()
    serializer_class = DoacaoSerializer
    # Permite que qualquer um doe (IsAuthenticated ou AllowAny, mas queremos que anônimos doem também)
    permission_classes = [IsAuthenticatedOrReadOnly] # Ou [AllowAny] se preferir

    def perform_create(self, serializer):
        # A MÁGICA ACONTECE AQUI:
        # Se o usuário mandou um Token (está logado), salvamos a doação no nome dele.
        if self.request.user.is_authenticated:
            serializer.save(usuario=self.request.user)
        else:
            # Se não tem token, salva como anônimo (usuario=None)
            serializer.save()

    # Filtro para o perfil (já tínhamos isso)
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.is_staff:
                return Doacao.objects.all() # Admin vê tudo
            return Doacao.objects.filter(usuario=user) # Usuário vê só as suas
        return Doacao.objects.none() # Anônimo não vê lista de doações (segurança)

class AjudaViewSet(viewsets.ModelViewSet):
    queryset = Ajuda.objects.all()
    serializer_class = AjudaSerializer
    permission_classes = [IsAuthenticated]
    
    # 1. SALVAR QUEM FEZ O PEDIDO (Essencial!)
    def perform_create(self, serializer):
        # O 'self.request.user' vem do Token que o Frontend enviou
        serializer.save(usuario=self.request.user)

    # 2. MOSTRAR SÓ OS PEDIDOS DO USUÁRIO (Essencial!)
    def get_queryset(self):
        user = self.request.user
        # Se for admin, vê tudo. Se for usuário comum, vê só os dele.
        if user.is_staff:
            return Ajuda.objects.all()
        return Ajuda.objects.filter(usuario=user)

class InstituicaoViewSet(viewsets.ModelViewSet):
    queryset = Instituicao.objects.all()
    serializer_class = InstituicaoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class ApoioInstituicaoViewSet(viewsets.ModelViewSet):
    queryset = ApoioInstituicao.objects.all()
    serializer_class = ApoioInstituicaoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
class ComentarioViewSet(viewsets.ModelViewSet):
    queryset = Comentario.objects.all()
    serializer_class = ComentarioSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # Pega o ID da campanha que vem na URL (ex: ?campanha_id=1) ou do corpo
        # Mas vamos simplificar: O frontend vai mandar o ID da campanha no corpo, 
        # mas como 'read_only', precisamos pegar do request.data ou URL.
        
        # Forma mais robusta: Frontend manda o ID na URL
        campanha_id = self.request.data.get('campanha_id')
        campanha = Campanha.objects.get(pk=campanha_id)
        
        serializer.save(usuario=self.request.user, campanha=campanha)

class DepoimentoViewSet(viewsets.ReadOnlyModelViewSet):
    # ReadOnly porque só queremos MOSTRAR na home, ninguém cria pelo site
    queryset = Depoimento.objects.all()
    serializer_class = DepoimentoSerializer
    permission_classes = [AllowAny] # Público: todo mundo pode ver