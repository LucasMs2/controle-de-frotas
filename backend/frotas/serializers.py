from rest_framework import serializers
from .models.models import Onibus, Motorista, Alocacao

#Serializers para a tradução em JSON
class OnibusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Onibus
        fields = '__all__'

class MotoristaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Motorista
        fields = '__all__'

class AlocacaoSerializer(serializers.ModelSerializer):
    motorista_nome = serializers.ReadOnlyField(source='motorista.nome')
    onibus_placa = serializers.ReadOnlyField(source='onibus.placa')
    onibus_modelo = serializers.ReadOnlyField(source='onibus.modelo')

    class Meta:
        model = Alocacao
        fields = [
            'id', 'motorista', 'onibus', 'data_alocacao',
            'motorista_nome', 'onibus_placa', 'onibus_modelo'
        ]