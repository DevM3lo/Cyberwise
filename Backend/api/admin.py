# No arquivo: backend/api/admin.py

from django.contrib import admin
from .models import (
    Usuario, Campanha, Evento, Doacao, Ajuda, 
    Instituicao, ApoioInstituicao
)

# --- Define os Inlines "Polidos" ---
class ApoioInstituicaoInline(admin.TabularInline):
    model = ApoioInstituicao
    extra = 1 # Mostra 1 slot vazio para adicionar um novo apoio

# --- Define as Classes de Admin "Polidas" ---
class CampanhaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'status', 'data_inicio')
    list_filter = ('status',)
    search_fields = ('titulo',)
    # Adicionamos o "inline" aqui
    inlines = [ApoioInstituicaoInline]

# --- Registros ---
# Registamos todos os modelos normais
admin.site.register(Usuario)
admin.site.register(Evento)
admin.site.register(Doacao)
admin.site.register(Ajuda)
admin.site.register(Instituicao)

# --- Verificação e Registo "Polido" da Campanha ---
# (Isto evita o crash de "Não Registado")

# 1. Tenta desregistar a Campanha (caso ela já esteja registada)
try:
    admin.site.unregister(Campanha)
except admin.sites.NotRegistered:
    pass # Não faz mal, significa que não estava registada

# 2. Agora regista a Campanha com a nossa nova classe "polida"
admin.site.register(Campanha, CampanhaAdmin)