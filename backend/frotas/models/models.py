from django.db import models
from django.core.exceptions import ValidationError

'''
Modelagem das tabelas do banco de dados, mapeei os campos mínimos de motorista e onibus e acrescentei uma tabela de
alocação para relacionar os onibus e os motoristas
'''
class Onibus(models.Model):
    placa = models.CharField(max_length=10, unique=True)
    modelo = models.CharField(max_length=100)
    ano = models.IntegerField()
    status = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.modelo} ({self.placa})"

class Motorista(models.Model):
    nome = models.CharField(max_length=200)
    cpf = models.CharField(max_length=11, unique=True)
    cnh = models.CharField(max_length=20, unique=True)
    categoria_cnh = models.CharField(max_length=2)
    status = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nome} - {self.cnh}"

class Alocacao(models.Model):
    motorista = models.ForeignKey(Motorista, on_delete=models.CASCADE)
    onibus = models.ForeignKey(Onibus, on_delete=models.CASCADE)
    data_alocacao = models.DateField()


    # Regras de negócio para validar a alocação de motoristas e onibus que contenham apenas o status ATIVO
    # e impedir duas alocações do mesmo motorista no dia e dois motoristas no mesmo veículo.
    def clean(self):
        if not self.motorista.status:
            raise ValidationError("Apenas motoristas ativos podem ser alocados.")

        if not self.onibus.status:
            raise ValidationError("Apenas ônibus ativos podem ser alocados.")

        if Alocacao.objects.filter(motorista=self.motorista, data_alocacao=self.data_alocacao).exclude(pk=self.pk).exists():
            raise ValidationError("Este motorista já possui uma alocação para este dia.")

        if Alocacao.objects.filter(onibus=self.onibus, data_alocacao=self.data_alocacao).exclude(pk=self.pk).exists():
            raise ValidationError("Este ônibus já possui um motorista alocado para este dia.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)