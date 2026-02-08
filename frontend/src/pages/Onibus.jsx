import { useEffect, useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import api from '../services/api';

const Onibus = () => {
  const [frota, setFrota] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [dadosEditados, setDadosEditados] = useState({});
  const [novoOnibus, setNovoOnibus] = useState({ placa: '', modelo: '', ano: '', status: true });

  useEffect(() => {
    carregarOnibus();
  }, []);

  //Carrega a visualização dos onibus
  const carregarOnibus = () => {
    api.get('onibus/')
      .then(res => {
        const ordenados = res.data.sort((a, b) => b.status - a.status);
        setFrota(ordenados);
      })
      .catch(err => console.error("Erro ao carregar frota:", err));
  };

  const aplicarMascaraPlaca = (v) => v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);

  //Valida as informações do onibus para evitar caracterer a mais e faz um filtro de data 1980 <= Data inserida <= Ano atual
  const validarOnibus = (dados) => {
    const anoAtual = new Date().getFullYear();
    const placaLimpa = dados.placa.replace(/[^A-Z0-9]/g, '');

    if (placaLimpa.length !== 7) {
        alert("A placa deve ter 7 caracteres (letras e números).");
        return false;
    }

    const anoInt = parseInt(dados.ano);
    if (anoInt < 1980 || anoInt > anoAtual) {
        alert(`O ano deve estar entre 1980 e ${anoAtual}.`);
    return false;
    }
  return true;
};

  //Adiciona um onibus a visualização da lista e no banco de dados
  const adicionarOnibus = async (e) => {
    e.preventDefault();
    if (!validarOnibus(novoOnibus)) return;
    try {
      await api.post('onibus/', novoOnibus);
      setNovoOnibus({ placa: '', modelo: '', ano: '', status: true });
      carregarOnibus();
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
    }
  };

  //Inicia a edição com o click do usuário
  const clickEditarOnibus = (o) => {
    setEditandoId(o.id);
    setDadosEditados(o);
  };

  //Salva a edição do onibus no banco de dados
  const editarOnibus = async (id) => {
    if (!validarOnibus(dadosEditados)) return;

    try {
      await api.put(`onibus/${id}/`, dadosEditados);
      setEditandoId(null);
      carregarOnibus();
  } catch (err) { console.error("Erro ao salvar:", err); }
};

  //Deleta um onibus da visualização da lista e do banco de dados
  const deletarOnibus = async (id) => {
    if (window.confirm("ATENÇÃO: Remover veículo DEFINITIVAMENTE do banco de dados?")) {
      try {
        // Adição do parâmetro ?force=true para acionar o Hard Delete no seu Django
        await api.delete(`onibus/${id}/?force=true`);

        // Filtra a lista local para sumir do frontend imediatamente
        setFrota(prev => prev.filter(o => o.id !== id));

        alert("Veículo excluído permanentemente!");
    } catch (err) {
      console.error("Erro ao deletar:", err.response?.data || err.message);
      alert("Erro ao excluir veículo do banco de dados.");
    }
  }
};

  const mudarStatus = async (id, novoStatus) => {
    await api.patch(`onibus/${id}/`, { status: novoStatus });
    carregarOnibus();
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-[#1a2b56] uppercase mb-6">Gestão de Frota - Ônibus</h2>

      {/* Formulário para inserir um novo onibus */}
      <form onSubmit={adicionarOnibus} className="flex flex-wrap justify-center items-end gap-3 mb-8 bg-gray-50 p-6 rounded-lg shadow-inner w-full">
        <div className="flex flex-col w-32">
          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Placa</label>
          <input className="p-2 border rounded bg-white text-center font-mono outline-none focus:ring-2 focus:ring-blue-400" placeholder="ABC1D23" value={novoOnibus.placa} onChange={e => setNovoOnibus({...novoOnibus, placa: aplicarMascaraPlaca(e.target.value)})} required />
        </div>
        <div className="flex flex-col flex-1 min-w-[200px] max-w-[400px]">
          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Modelo / Marca</label>
          <input className="p-2 border rounded bg-white outline-none focus:ring-2 focus:ring-blue-400" value={novoOnibus.modelo} onChange={e => setNovoOnibus({...novoOnibus, modelo: e.target.value})} required />
        </div>
        <div className="flex flex-col w-28">
          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Ano</label>
          <input type="number" className="p-2 border rounded bg-white text-center outline-none focus:ring-2 focus:ring-blue-400" placeholder="2024" value={novoOnibus.ano} onChange={e => setNovoOnibus({...novoOnibus, ano: e.target.value})} required />
        </div>
        <button type="submit" className="bg-[#0071ce] text-white px-6 py-2 h-[42px] font-bold rounded hover:bg-blue-700 uppercase shadow-md">Adicionar</button>
      </form>

      <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-[#0071ce]">
              <th className="p-4 text-[#1a2b56] font-bold uppercase text-xs">Dados do Veículo</th>
              <th className="p-4 text-[#1a2b56] font-bold uppercase text-xs">Status</th>
              <th className="p-4 text-[#1a2b56] font-bold uppercase text-xs">Mudar Status</th>
            </tr>
          </thead>
          <tbody>
            {frota.map((o) => (
              <tr key={o.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  {editandoId === o.id ? (
                    <div className="flex gap-2">
                      <input className="border p-1 rounded w-24 text-center font-mono" value={dadosEditados.placa} onChange={e => setDadosEditados({...dadosEditados, placa: aplicarMascaraPlaca(e.target.value)})} />
                      <input className="border p-1 rounded w-full" value={dadosEditados.modelo} onChange={e => setDadosEditados({...dadosEditados, modelo: e.target.value})} />
                      <input className="border p-1 rounded w-20 text-center" value={dadosEditados.ano} onChange={e => setDadosEditados({...dadosEditados, ano: e.target.value})} />
                    </div>
                  ) : (
                    <div className="text-left pl-4">
                      <div className="font-bold text-gray-800 font-mono text-sm">{o.placa} - {o.modelo}</div>
                      <div className="text-gray-400 text-xs">Ano de Fabricação: {o.ano}</div>
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${o.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {o.status ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-4 flex justify-center items-center gap-4">
                  <select value="" onChange={(e) => mudarStatus(o.id, e.target.value === 'true')} className="text-[11px] p-1 border rounded bg-white font-bold uppercase outline-none">
                    <option value="" disabled hidden>Alterar Status</option>
                    <option value="true">Ativar</option>
                    <option value="false">Inativar</option>
                  </select>
                  <div className="flex gap-3 border-l pl-4">
                    {editandoId === o.id ? (
                      <>
                        <Check size={20} className="text-green-600 cursor-pointer hover:scale-125 transition-transform" onClick={() => editarOnibus(o.id)} />
                        <X size={20} className="text-gray-400 cursor-pointer hover:scale-125 transition-transform" onClick={() => setEditandoId(null)} />
                      </>
                    ) : (
                      <>
                        <Pencil size={18} className="text-blue-600 cursor-pointer hover:text-blue-800" onClick={() => clickEditarOnibus(o)} />
                        <Trash2 size={18} className="text-red-600 cursor-pointer hover:text-red-800" onClick={() => deletarOnibus(o.id)} />
                      </>
                    )}
                  </div>
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