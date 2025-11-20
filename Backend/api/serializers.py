from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers
from .models import (
    Usuario, Campanha, Evento, Doacao, Ajuda, 
    Instituicao, ApoioInstituicao, Comentario 
)

# --- 1. USUÁRIO & AUTH ---
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'tipo']

class CustomRegisterSerializer(RegisterSerializer):
    tipo = serializers.ChoiceField(choices=Usuario.TIPO_CHOICES)
    # Correção do bug de registo
    def save(self, request):
        user = super().save(request)
        user.tipo = self.validated_data.get('tipo', 'visitante')
        user.save()
        return user

# --- 2. ITENS SIMPLES ---
class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = '__all__'

class DoacaoSerializer(serializers.ModelSerializer):
    usuario_username = serializers.ReadOnlyField(source='usuario.username')
    class Meta:
        model = Doacao
        fields = ['id', 'tipo', 'valor', 'descricao', 'campanha', 'usuario', 'data_doacao', 'usuario_username']
        read_only_fields = ['data_doacao', 'usuario_username']

class ApoioInstituicaoSerializer(serializers.ModelSerializer):
    nome_instituicao = serializers.ReadOnlyField(source='instituicao.nome')
    class Meta:
        model = ApoioInstituicao
        fields = ['id', 'instituicao', 'nome_instituicao', 'tipo_apoio']

class InstituicaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instituicao
        fields = '__all__'

class AjudaSerializer(serializers.ModelSerializer):
    usuario_username = serializers.ReadOnlyField(source='usuario.username')
    class Meta:
        model = Ajuda
        fields = '__all__'
        read_only_fields = ['data_solicitacao', 'usuario_username', 'status', 'usuario']

# --- 3. CAMPANHA (A Lógica Complexa) ---

# Para a Lista (Cards na Home/Participar)
class CampanhaListSerializer(serializers.ModelSerializer):
    participantes_count = serializers.SerializerMethodField()
    class Meta:
        model = Campanha
        # Inclui imagem_capa para o card ter foto
        fields = ['id', 'titulo', 'descricao', 'status', 'participantes_count', 'imagem_capa']

    def get_participantes_count(self, obj):
        return obj.participantes.count()

class ComentarioSerializer(serializers.ModelSerializer):
    usuario_username = serializers.ReadOnlyField(source='usuario.username')
    
    class Meta:
        model = Comentario
        fields = ['id', 'usuario_username', 'texto', 'data_criacao', 'campanha']
        read_only_fields = ['data_criacao', 'usuario_username', 'campanha']

# Para o Detalhe (Página individual)
class CampanhaDetailSerializer(serializers.ModelSerializer):
    eventos = EventoSerializer(many=True, read_only=True)
    doacoes = DoacaoSerializer(many=True, read_only=True)
    apoios = ApoioInstituicaoSerializer(many=True, read_only=True, source='apoioinstituicao_set')
    
    # ADICIONE ISTO:
    comentarios = ComentarioSerializer(many=True, read_only=True)

    participantes_count = serializers.SerializerMethodField()
    participantes = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Campanha
        fields = [
            'id', 'titulo', 'descricao', 'data_inicio', 'data_fim', 'status', 'imagem_capa',
            'eventos', 'doacoes', 'apoios', 'comentarios', # <-- ADICIONE 'comentarios' AQUI
            'participantes', 'participantes_count'
        ]
    
    def get_participantes_count(self, obj):
        return obj.participantes.count()