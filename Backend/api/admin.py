from django.contrib import admin
from .models import (
    Usuario, Campanha, Evento, Doacao, Ajuda, 
    Instituicao, ApoioInstituicao, Comentario,
    Depoimento
)

# Inlines
class ApoioInstituicaoInline(admin.TabularInline):
    model = ApoioInstituicao
    extra = 1

# Configuração da Campanha
class CampanhaAdmin(admin.ModelAdmin):
    inlines = [ApoioInstituicaoInline]
    list_display = ('titulo', 'status', 'data_inicio')

# Registos
admin.site.register(Usuario)
try:
    admin.site.unregister(Campanha)
except admin.sites.NotRegistered:
    pass
admin.site.register(Campanha, CampanhaAdmin)

admin.site.register(Evento)
admin.site.register(Doacao)
admin.site.register(Instituicao)

# ESTA LINHA É ESSENCIAL PARA APARECER NO ADMIN:
admin.site.register(Ajuda)
admin.site.register(Comentario)
admin.site.register(Depoimento)