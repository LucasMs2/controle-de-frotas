from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Onibus, Motorista, Alocacao
from .serializers import OnibusSerializer, MotoristaSerializer, AlocacaoSerializer

''' Usei ModelViewSet para Onibus e Motorista porque o teste pede um CRUD padrão, e resolvi seguir esse caminho
por apresentar uma estrutura de código mais clean e menos verbosa
'''
class OnibusViewSet(viewsets.ModelViewSet):
    queryset = Onibus.objects.all()
    serializer_class = OnibusSerializer

    # Sobrescrevendo o destroy para implementar a funcionalidade de não deletar, mas sim mudar o status para INATIVO
    def destroy(self, request, *args, **kwargs):
        onibus = self.get_object()
        onibus.status = False
        onibus.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class MotoristaViewSet(viewsets.ModelViewSet):
    queryset = Motorista.objects.all()
    serializer_class = MotoristaSerializer

    def destroy(self, request, *args, **kwargs):
        motorista = self.get_object()
        motorista.status = False
        motorista.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AlocacaoViewSet(viewsets.ModelViewSet):
    queryset = Alocacao.objects.all()
    serializer_class = AlocacaoSerializer

    # Implementando o requisito de filtrar alocações por data (GET /alocacoes?data=YYYY-MM-DD)
    def get_queryset(self):
        queryset = Alocacao.objects.all()
        data_param = self.request.query_params.get('data')
        if data_param:
            queryset = queryset.filter(data_alocacao=data_param)
        return queryset


    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                # Ao chamar o save(), o Django executa as validações de regra de negócio
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)