import { useEffect, useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import api from '../services/api';

const Motorista = () => {
  const [motoristas, setMotoristas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [dadosEditados, setDadosEditados] = useState({});
  const [novoMotorista, setNovoMotorista] = useState({
    nome: '',
    cpf: '',
    cnh: '',
    categoria_cnh: 'D',
    status: true
  });

  useEffect(() => { carregarMotoristas(); }, []);

  //Carrega a visualização dos motoristas e ordena "ATIVOS primeiro"
  const carregarMotoristas = () => {
    api.get('motoristas/')
      .then(res => {
        const ordenados = res.data.sort((a, b) => b.status - a.status);
        setMotoristas(ordenados);
      })
      .catch(err => console.error("Erro ao carregar:", err));
  };

  //Validação de dados para evitar menos ou mais caracteres e letras
  const validarDadosMotorista = (dados) => {
  const cpfLimpo = dados.cpf.replace(/\D/g, '');
  const cnhLimpa = dados.cnh.replace(/\D/g, '');

  if (cpfLimpo.length !== 11) {
    alert("O CPF deve conter 11 números.");
    return false;
  }
  if (cnhLimpa.length !== 9) {
    alert("A CNH deve conter 9 dígitos numéricos.");
    return false;
  }
  return true;
};

  const aplicarMascaraCPF = (v) => {
    return v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  };

  //Adiciona um novo motorista ao banco de dados
  const adicionarMotorista = async (e) => {
    e.preventDefault();
    if (!validarDadosMotorista(novoMotorista)) return;

    try {
      const dados = { ...novoMotorista, cpf: novoMotorista.cpf.replace(/\D/g, '') };
      await api.post('motoristas/', dados);
      setNovoMotorista({ nome: '', cpf: '', cnh: '', categoria_cnh: 'D', status: true });
      carregarMotoristas();
    } catch (err) { console.error("Erro no cadastro:", err.response?.data); }
  };

  //Inicia a ação de edição de motorista com o click do usuário
  const clickEditarMotorista = (m) => {
    setEditandoId(m.id);
    setDadosEditados(m);
  };

  //Salva a edição do motorista no banco de dados
  const editarMotorista = async (id) => {
  if (!validarDadosMotorista(dadosEditados)) return;

  try {
    const dadosParaSalvar = { ...dadosEditados, cpf: dadosEditados.cpf.replace(/\D/g, '') };
    await api.put(`motoristas/${id}/`, dadosParaSalvar);
    setEditandoId(null);
    carregarMotoristas();
  } catch (err) { console.error("Erro ao salvar:", err); }
};

  //Deleta um motorista da visualização da tabela e do banco de dados ou desabilita caso o usuário apenas mude o status
  const deletarMotorista = async (id) => {
  if (window.confirm("ATENÇÃO: Remover motorista DEFINITIVAMENTE?")) {
    try {
      await api.delete(`motoristas/${id}/`);
      setMotoristas(prev => prev.filter(m => m.id !== id));

      alert("Motorista removido com sucesso!");
    } catch (err) {
      console.error("Erro ao deletar:", err.response?.data || err.message);
      alert("Não foi possível excluir o motorista. Verifique se ele possui vínculos.");
    }
  }
};
  //Carrega o novo status quando alterado (ATIVO, INATIVO)
  const mudarStatus = async (id, novoStatus) => {
    await api.patch(`motoristas/${id}/`, { status: novoStatus });
    carregarMotoristas();
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-[#1a2b56] uppercase mb-6">Gestão de Motoristas</h2>

      {/* Formulário para inserir um novo motorista */}
      <form onSubmit={adicionarMotorista} className="flex flex-wrap justify-center items-end gap-3 mb-8 bg-gray-50 p-6 rounded-lg shadow-inner w-full">
        <div className="flex flex-col flex-1 min-w-[250px] max-w-[350px]">
          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Nome Completo</label>
          <input className="p-2 border rounded bg-white outline-none" value={novoMotorista.nome} onChange={e => setNovoMotorista({...novoMotorista, nome: e.target.value})} required />
        </div>
        <div className="flex flex-col w-36">
          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">CPF</label>
          <input maxLength="14" className="p-2 border rounded bg-white text-center" value={novoMotorista.cpf} onChange={e => setNovoMotorista({...novoMotorista, cpf: aplicarMascaraCPF(e.target.value)})} required />
        </div>
        <div className="flex flex-col w-32">
          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Nº CNH</label>
          <input maxLength="9" className="p-2 border rounded bg-white text-center" value={novoMotorista.cnh} onChange={e => setNovoMotorista({...novoMotorista, cnh: e.target.value})} required />
        </div>
        <div className="flex flex-col w-28">
          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Categoria</label>
          <select className="p-2 border rounded bg-white cursor-pointer" value={novoMotorista.categoria_cnh} onChange={e => setNovoMotorista({...novoMotorista, categoria_cnh: e.target.value})}>
            <option value="D">Cat. D</option>
            <option value="E">Cat. E</option>
          </select>
        </div>
        <button type="submit" className="bg-[#0071ce] text-white px-6 py-2 h-[42px] font-bold rounded hover:bg-blue-700 uppercase shadow-md">Adicionar</button>
      </form>

      {/* Tabela de onibus */}
      <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-[#0071ce]">
              <th className="p-4 text-[#1a2b56] font-bold uppercase text-xs">Dados do Motorista</th>
              <th className="p-4 text-[#1a2b56] font-bold uppercase text-xs">Status</th>
              <th className="p-4 text-[#1a2b56] font-bold uppercase text-xs">Mudar Status</th>
            </tr>
          </thead>
          <tbody>
            {motoristas.map((m) => (
              <tr key={m.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  {editandoId === m.id ? (
                    <div className="flex flex-wrap gap-2 justify-center">
                      <input className="border p-1 rounded w-48" value={dadosEditados.nome} onChange={e => setDadosEditados({...dadosEditados, nome: e.target.value})} />
                      <input maxLength="14" className="border p-1 rounded w-32 text-center" value={dadosEditados.cpf} onChange={e => setDadosEditados({...dadosEditados, cpf: aplicarMascaraCPF(e.target.value)})} />
                      <input maxLength="9" className="border p-1 rounded w-28 text-center" placeholder="CNH" value={dadosEditados.cnh} onChange={e => setDadosEditados({...dadosEditados, cnh: e.target.value})} />
                      <select className="border p-1 rounded w-20" value={dadosEditados.categoria_cnh} onChange={e => setDadosEditados({...dadosEditados, categoria_cnh: e.target.value})}>
                        <option value="D">D</option>
                        <option value="E">E</option>
                      </select>
                    </div>
                  ) : (
                    <div className="text-left pl-4">
                      <div className="font-bold text-gray-800 uppercase text-sm">{m.nome}</div>
                      <div className="text-gray-400 text-xs font-medium">CPF: {aplicarMascaraCPF(m.cpf)} | CNH: {m.cnh} ({m.categoria_cnh})</div>
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${m.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {m.status ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-4 flex justify-center items-center gap-4">
                  <select value="" onChange={(e) => mudarStatus(m.id, e.target.value === 'true')} className="text-[11px] p-1 border rounded bg-white font-bold uppercase outline-none">
                    <option value="" disabled hidden>Alterar Status</option>
                    <option value="true">Ativar</option>
                    <option value="false">Inativar</option>
                  </select>
                  <div className="flex gap-3 border-l pl-4">
                    {editandoId === m.id ? (
                      <><Check size={20} className="text-green-600 cursor-pointer" onClick={() => editarMotorista(m.id)}
                     /><X size={20} className="text-gray-400 cursor-pointer" onClick={() => setEditandoId(null)} /></>
                    ) : (
                      <><Pencil size={18} className="text-blue-600 cursor-pointer" onClick={() => clickEditarMotorista(m)}
                     /><Trash2 size={18} className="text-red-600 cursor-pointer" onClick={() => deletarMotorista(m.id)} /></>
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

export default Motorista;