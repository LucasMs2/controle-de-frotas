import { useEffect, useState } from 'react';
import api from '../services/api';

const Onibus = () => {
  const [frota, setFrota] = useState([]);
  const [novoOnibus, setNovoOnibus] = useState({
    placa: '',
    modelo: '',
    ano: '',
    status: true
  });

  useEffect(() => {
    carregarOnibus();
  }, []);

  // Ordenação: Ativos (true) sempre no topo
  const carregarOnibus = () => {
    api.get('onibus/')
      .then(res => {
        const ordenados = res.data.sort((a, b) => b.status - a.status);
        setFrota(ordenados);
      })
      .catch(err => console.error("Erro ao carregar frota:", err));
  };

  //Altera a entrada da placa para uppercase
  const aplicarMascaraPlaca = (valor) => {
    return valor.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('onibus/', novoOnibus);
      setNovoOnibus({ placa: '', modelo: '', ano: '', status: true });
      carregarOnibus();
    } catch (error) {
      console.error("Erro ao cadastrar ônibus:", error.response?.data || error.message);
    }
  };

  const mudarStatus = async (id, novoStatus) => {
    try {
      await api.patch(`onibus/${id}/`, { status: novoStatus });
      carregarOnibus();
    } catch (error) {
      console.error("Erro ao mudar status do veículo:", error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-[#1a2b56] uppercase mb-6">Gestão dos Ônibus</h2>

      {/* Inserir um onibus */}
      <form onSubmit={handleAdd} className="flex flex-wrap justify-center items-end gap-3 mb-8 bg-gray-50 p-6 rounded-lg shadow-inner w-full">

        <div className="flex flex-col w-40">
          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Placa</label>
          <input
            className="p-2 border rounded bg-white text-center outline-none focus:ring-2 focus:ring-blue-400 font-mono"
            placeholder="ABC1D23"
            value={novoOnibus.placa}
            onChange={e => setNovoOnibus({...novoOnibus, placa: aplicarMascaraPlaca(e.target.value)})}
            required
          />
        </div>

        <div className="flex flex-col flex-1 min-w-[200px] max-w-[400px]">
          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Modelo / Marca</label>
          <input
            className="p-2 border rounded bg-white outline-none focus:ring-2 focus:ring-blue-400"
            value={novoOnibus.modelo}
            onChange={e => setNovoOnibus({...novoOnibus, modelo: e.target.value})}
            required
          />
        </div>

        <div className="flex flex-col w-32">
          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Ano</label>
          <input
            type="number"
            className="p-2 border rounded bg-white text-center outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="2026"
            value={novoOnibus.ano}
            onChange={e => setNovoOnibus({...novoOnibus, ano: e.target.value})}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-[#0071ce] text-white px-6 py-2 h-[42px] font-bold rounded hover:bg-blue-700 transition-all uppercase shadow-md active:scale-95"
        >
          Adicionar
        </button>
      </form>

      {/* Tabela de onibus */}
      <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-[#0071ce]">
              <th className="p-4 text-[#1a2b56] font-bold uppercase text-xs">Placa</th>
              <th className="p-4 text-[#1a2b56] font-bold uppercase text-xs text-left">Modelo</th>
              <th className="p-4 text-[#1a2b56] font-bold uppercase text-xs">Ano</th>
              <th className="p-4 text-[#1a2b56] font-bold uppercase text-xs">Status Atual</th>
              <th className="p-4 text-[#1a2b56] font-bold uppercase text-xs">Ação</th>
            </tr>
          </thead>
          <tbody>
            {frota.map((o) => (
              <tr key={o.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4 font-mono font-bold text-gray-800">{o.placa}</td>
                <td className="p-4 text-gray-700 text-left">{o.modelo}</td>
                <td className="p-4 text-gray-700">{o.ano}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${o.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {o.status ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-4 flex justify-center">
                  <select
                    value=""
                    onChange={(e) => mudarStatus(o.id, e.target.value === 'true')}
                    className="text-[11px] p-1 border rounded bg-white text-gray-600 font-bold uppercase outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer shadow-sm"
                  >
                    <option value="" disabled hidden>Selecionar Status</option>
                    <option value="true" className="text-green-600">Ativar</option>
                    <option value="false" className="text-red-600">Inativar</option>
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

export default Onibus;