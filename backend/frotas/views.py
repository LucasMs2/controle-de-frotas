from rest_framework import viewsets, status
from rest_framework.response import Response
from .models.models import Onibus, Motorista, Alocacao
from .serializers import OnibusSerializer, MotoristaSerializer, AlocacaoSerializer

''' Usei ModelViewSet para Onibus e Motorista porque o teste pede um CRUD padrão, e resolvi seguir esse caminho
por apresentar uma estrutura de código mais clean e menos verbosa
'''
class OnibusViewSet(viewsets.ModelViewSet):
    queryset = Onibus.objects.all()
    serializer_class = OnibusSerializer

    '''Inicialmente sobrescrevi o destroy para implementar a funcionalidade de não deletar, mas sim mudar o status para INATIVO
    depois tive que editar essa função para adicionar um "force delete" para implementar também a exclusão permanente'''
    def destroy(self, request, *args, **kwargs):
        obj = self.get_object()
        # Verifica se o parâmetro 'force=true' foi enviado na URL
        force_delete = request.query_params.get('force') == 'true'

        if force_delete:
            obj.delete()  # Exclusão definitiva do Banco de Dados
            return Response({"message": "Excluído permanentemente"}, status=status.HTTP_204_NO_CONTENT)
        else:
            obj.status = False  # Apenas desativa o objeto
            obj.save()
            return Response({"message": "Desativado com sucesso"}, status=status.HTTP_204_NO_CONTENT)

class MotoristaViewSet(viewsets.ModelViewSet):
    queryset = Motorista.objects.all()
    serializer_class = MotoristaSerializer

class AlocacaoViewSet(viewsets.ModelViewSet):
    queryset = Alocacao.objects.all().order_by('-data_alocacao')
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