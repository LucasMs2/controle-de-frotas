from django.test import TestCase
from django.core.exceptions import ValidationError
from frotas.models.models import Onibus, Motorista, Alocacao
from datetime import date


class AlocacaoTestCase(TestCase):
    def setUp(self):
        # Cria dados iniciais para o teste
        self.motorista1 = Motorista.objects.create(nome="Lucas", cpf="11111111111", cnh =1111111, status=True)
        self.motorista2 = Motorista.objects.create(nome="Rafael", cpf="22222222222", cnh =2222222, status=True)
        self.motorista3 = Motorista.objects.create(nome="Guilherme", cpf="33333333333", cnh =3333333, status=True)

        self.onibus1 = Onibus.objects.create(placa="ABC1234", modelo="Mercedes 1", ano=2022, status=True)
        self.onibus2 = Onibus.objects.create(placa="ABC5678", modelo="Mercedes 2", ano=2024, status=True)
        self.onibus3= Onibus.objects.create(placa="ABC9012", modelo="Mercedes 3", ano=2026, status=True)

    def test_alocacao(self):
        """Valida uma alocação realizada"""
        alocacao = Alocacao(
            motorista=self.motorista2,
            onibus=self.onibus2,
            data_alocacao=date.today()
        )
        alocacao.full_clean()
        alocacao.save()
        self.assertEqual(Alocacao.objects.count(), 1)

    def teste_conflito_motorista_mesmo_dia(self):
        """Valida que um motorista não pode estar em dois ônibus no mesmo dia"""
        Alocacao.objects.create(motorista=self.motorista1, onibus=self.onibus1, data_alocacao=date.today())

        proxima_alocacao = Alocacao(motorista=self.motorista1, onibus=self.onibus2, data_alocacao=date.today())
        with self.assertRaises(ValidationError):
            proxima_alocacao.full_clean()

    def test_conflito_veiculo_ja_ocupado(self):
        """Valida que um ônibus não pode ter dois motoristas no mesmo dia """
        Alocacao.objects.create(
            motorista=self.motorista3,
            onibus=self.onibus3,
            data_alocacao=date.today()
        )
        segunda_alocacao = Alocacao(
            motorista=self.motorista2,
            onibus=self.onibus3,
            data_alocacao=date.today()
        )

        with self.assertRaises(ValidationError):
            segunda_alocacao.full_clean()

    def teste_motorista_inativo(self):
        """Valida que um motorista inativo não pode ser alocado"""
        self.motorista3.status = False
        self.motorista3.save()

        alocacao_inativa = Alocacao(motorista=self.motorista3, onibus=self.onibus3, data_alocacao=date.today())
        with self.assertRaises(ValidationError):
            alocacao_inativa.full_clean()