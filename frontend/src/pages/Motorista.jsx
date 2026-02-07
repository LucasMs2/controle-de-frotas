import { useEffect, useState } from 'react';
import api from '../services/api';

const Motorista = () => {
  const [motoristas, setMotoristas] = useState([]);
  const [novoMotorista, setNovoMotorista] = useState({
    nome: '',
    cpf: '',
    cnh: '',
    categoria_cnh: 'D',
    status: true
  });

  useEffect(() => {
    carregarMotoristas();
  }, []);

  // Ordenação: Ativos (true) sempre no topo
  const carregarMotoristas = () => {
    api.get('motoristas/')
      .then(res => {
        const ordenados = res.data.sort((a, b) => b.status - a.status);
        setMotoristas(ordenados);
      })
      .catch(err => console.error("Erro ao carregar:", err));
  };

  const aplicarMascaraCPF = (valor) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const dadosParaEnviar = {
        ...novoMotorista,
        cpf: novoMotorista.cpf.replace(/\D/g, '') // Limpa para o Django
      };
      await api.post('motoristas/', dadosParaEnviar);
      setNovoMotorista({ nome: '', cpf: '', cnh: '', categoria_cnh: 'D', status: true });
      carregarMotoristas();
    } catch (error) {
      console.error("Erro no cadastro:", error.response?.data || error.message);
    }
  };

  const mudarStatus = async (id, novoStatus) => {
    try {
      await api.patch(`motoristas/${id}/`, { status: novoStatus });
      carregarMotoristas();
    } catch (error) {
      console.error("Erro ao mudar status:", error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-[#1a2b56] uppercase mb-6">Gestão de Motoristas</h2>

      {/* Inserir um novo motorista */}
      <form onSubmit={handleAdd} className="flex flex-wrap justify-center items-end gap-3 mb-8 bg-gray-50 p-6 rounded-lg shadow-inner w-full">
        <div className="flex flex-col flex-1 min-w-[280px] max-w-[400px]">
          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Nome Completo</label>
          <input className="p-2 border rounded bg-white outline-none focus:ring-2 focus:ring-blue-400" placeholder="Ex: João da Silva" value={novoMotorista.nome} onChange={e => setNovoMotorista({...novoMotorista, nome: e.target.value})} required />
        </div>

        <div className="flex flex-col w-40">
          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">CPF</label>
          <input className="p-2 border rounded bg-white text-center outline-none focus:ring-2 focus:ring-blue-400" placeholder="000.000.000-00" value={novoMotorista.cpf} onChange={e => setNovoMotorista({...novoMotorista, cpf: aplicarMascaraCPF(e.target.value)})} required />
        </div>

        <div className="flex flex-col w-36">
          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Nº CNH</label>
          <input className="p-2 border rounded bg-white text-center outline-none focus:ring-2 focus:ring-blue-400" placeholder="12345678" value={novoMotorista.cnh} onChange={e => setNovoMotorista({...novoMotorista, cnh: e.target.value})} required />
        </div>

        <div className="flex flex-col w-32">
          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Categoria</label>
          <select className="p-2 border rounded bg-white outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer" value={novoMotorista.categoria_cnh} onChange={e => setNovoMotorista({...novoMotorista, categoria_cnh: e.target.value})}>
            <option value="D">Cat. D</option>
            <option value="E">Cat. E</option>
          </select>
        </div>

        <button type="submit" className="bg-[#0071ce] text-white px-6 py-2 h-[42px] font-bold rounded hover:bg-blue-700 transition-all uppercase shadow-md">Adicionar</button>
      </form>

      {/* Tabela de Motoristas */}
      <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-[#0071ce]">
              <th className="p-4 text-[#1a2b56] font-bold uppercase text-xs text-left pl-8">Nome</th>
              <th className="p-4 text-[#1a2b56] font-bold uppercase text-xs">CPF</th>
              <th className="p-4 text-[#1a2b56] font-bold uppercase text-xs">Categoria</th>
              <th className="p-4 text-[#1a2b56] font-bold uppercase text-xs">Status Atual</th>
              <th className="p-4 text-[#1a2b56] font-bold uppercase text-xs">Mudar Status</th>
            </tr>
          </thead>
          <tbody>
            {motoristas.map((m) => (
              <tr key={m.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-700 text-left pl-8">{m.nome}</td>
                <td className="p-4 text-gray-700">{aplicarMascaraCPF(m.cpf)}</td>
                <td className="p-4 font-bold text-gray-800">{m.categoria_cnh}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${m.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {m.status ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-4 flex justify-center">
                  <select
                    value=""
                    onChange={(e) => mudarStatus(m.id, e.target.value === 'true')}
                    className="text-[11px] p-1 border rounded bg-white text-gray-600 font-bold uppercase outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer shadow-sm"
                  >
                    <option value="" disabled hidden>Selecionar Status</option>
                    <option value="true" className="text-green-600">Ativo</option>
                    <option value="false" className="text-red-600">Inativo</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Motorista;