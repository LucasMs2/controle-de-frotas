import { useEffect, useState } from 'react';
import api from '../services/api';
import { CalendarDays, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const Alocacao = () => {
  const [motoristasAtivos, setMotoristasAtivos] = useState([]);
  const [onibusAtivos, setOnibusAtivos] = useState([]);
  const [alocacoes, setAlocacoes] = useState([]);

  // Estados para Filtros
  const [filtroData, setFiltroData] = useState('');
  const [filtroMotorista, setFiltroMotorista] = useState('');
  const [filtroOnibus, setFiltroOnibus] = useState('');

  // Estados para Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(5);

  const hoje = new Date().toISOString().split('T')[0];
  const [novaAlocacao, setNovaAlocacao] = useState({ motorista: '', onibus: '', data_alocacao: hoje });

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    try {
      const [mRes, oRes, aRes] = await Promise.all([
        api.get('motoristas/'),
        api.get('onibus/'),
        api.get('alocacoes/')
      ]);
      setMotoristasAtivos(mRes.data.filter(m => m.status));
      setOnibusAtivos(oRes.data.filter(o => o.status));
      setAlocacoes(aRes.data);
    } catch (err) { console.error("Erro ao carregar:", err); }
  };

  //Caso dê erro na alocacao, extrai a mensagem para apresentar algo mais amigável
const extrairMensagemDeErro = (erroData) => {
  if (!erroData) return "Ocorreu um erro inesperado.";

  let conteudo = erroData.error || erroData;
  if (typeof conteudo === 'string') {
    return conteudo
      .replace(/{'__all__': \[?|{'non_field_errors': \[?|}/g, '') // Remove chaves e chaves de erro
      .replace(/^\['|'\]$/g, '') // Remove colchetes e aspas simples do início/fim
      .replace(/'/g, '') // Remove aspas simples restantes
      .replace(/\[|\]/g, ''); // Remove colchetes restantes
  }
  if (typeof conteudo === 'object') {
    const mensagens = conteudo.__all__ || conteudo.non_field_errors || Object.values(conteudo)[0];
    return Array.isArray(mensagens) ? mensagens[0] : mensagens;
  }
  return conteudo;
};

  //Verifica se a alocação pode ser realizada e salva ou retorna erro
  const confirmarEscala = async (e) => {
  e.preventDefault();
  try {
    await api.post('alocacoes/', novaAlocacao);
    alert("Alocação realizada com sucesso!");
    setNovaAlocacao({ motorista: '', onibus: '', data_alocacao: hoje });
    carregarDados();
  } catch (err) {
    const mensagemAmigavel = extrairMensagemDeErro(err.response?.data);
    alert(`Atenção: ${mensagemAmigavel}`);
  }
};

  // Lógica de Filtragem
  const alocacoesFiltradas = alocacoes.filter(a => {
    const matchData = filtroData ? a.data_alocacao === filtroData : true;
    const matchMotorista = filtroMotorista ? a.motorista === parseInt(filtroMotorista) : true;
    const matchOnibus = filtroOnibus ? a.onibus === parseInt(filtroOnibus) : true;
    return matchData && matchMotorista && matchOnibus;
  });

  // Lógica de Paginação
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const itensPaginados = alocacoesFiltradas.slice(indicePrimeiroItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(alocacoesFiltradas.length / itensPorPagina);

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-2xl font-bold text-[#1a2b56] uppercase mb-6 flex items-center gap-2">
        <CalendarDays /> Alocação Diária de Frotas
      </h2>

      {/* Insere uma nova alocação */}
      <form onSubmit={confirmarEscala} className="bg-white p-6 rounded-lg shadow-md w-full border-t-4 border-[#0071ce] mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Data</label>
          <input type="date" className="p-2 border rounded" value={novaAlocacao.data_alocacao} onChange={e => setNovaAlocacao({...novaAlocacao, data_alocacao: e.target.value})} required />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Motorista</label>
          <select className="p-2 border rounded" value={novaAlocacao.motorista} onChange={e => setNovaAlocacao({...novaAlocacao, motorista: e.target.value})} required>
            <option value="">Selecionar...</option>
            {motoristasAtivos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Ônibus</label>
          <select className="p-2 border rounded" value={novaAlocacao.onibus} onChange={e => setNovaAlocacao({...novaAlocacao, onibus: e.target.value})} required>
            <option value="">Selecionar...</option>
            {onibusAtivos.map(o => <option key={o.id} value={o.id}>{o.placa} - {o.modelo}</option>)}
          </select>
        </div>
        <button type="submit" className="bg-[#0071ce] text-white font-bold p-2 rounded hover:bg-blue-700 uppercase">Alocar</button>
      </form>

      {/* Filtros */}
      <div className="w-full bg-gray-100 p-4 rounded-t-lg border-b flex flex-wrap gap-4 items-center">
        <span className="flex items-center gap-2 text-sm font-bold text-gray-600 uppercase"><Filter size={16}/> Filtros:</span>
        <input type="date" className="p-1 border rounded text-sm" value={filtroData} onChange={e => setFiltroData(e.target.value)} />
        <select className="p-1 border rounded text-sm" value={filtroMotorista} onChange={e => setFiltroMotorista(e.target.value)}>
          <option value="">Todos Motoristas</option>
          {motoristasAtivos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
        <select className="p-1 border rounded text-sm" value={filtroOnibus} onChange={e => setFiltroOnibus(e.target.value)}>
          <option value="">Todos Veículos</option>
          {onibusAtivos.map(o => <option key={o.id} value={o.id}>{o.placa}</option>)}
        </select>
        <button className="text-xs text-blue-600 font-bold underline" onClick={() => {setFiltroData(''); setFiltroMotorista(''); setFiltroOnibus('');}}>Limpar</button>
      </div>

      {/* Tabela de alocações */}
      <div className="w-full bg-white shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1a2b56] text-white uppercase font-bold text-xs">
            <tr>
              <th className="p-4">Data</th>
              <th className="p-4 text-left">Motorista</th>
              <th className="p-4 text-left">Veículo (Placa/Modelo)</th>
            </tr>
          </thead>
          <tbody>
            {itensPaginados.length > 0 ? itensPaginados.map(a => (
              <tr key={a.id} className="border-b hover:bg-blue-50">
                <td className="p-4 text-center">{new Date(a.data_alocacao).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                <td className="p-4 font-bold">{a.motorista_nome}</td>
                <td className="p-4 uppercase">{a.onibus_placa} - {a.onibus_modelo}</td>
              </tr>
            )) : (
              <tr><td colSpan="3" className="p-10 text-center text-gray-400">Nenhuma alocação encontrada para os filtros aplicados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="w-full bg-gray-50 p-4 flex justify-between items-center rounded-b-lg border shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase">Itens por página:</span>
          <select
            className="border rounded text-xs p-1"
            value={itensPorPagina}
            onChange={e => {setItensPorPagina(Number(e.target.value)); setPaginaAtual(1);}}
          >
            {[5, 15, 25, 50, 75].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">Página {paginaAtual} de {totalPaginas || 1}</span>
          <div className="flex gap-2">
            <button
              disabled={paginaAtual === 1}
              onClick={() => setPaginaAtual(prev => prev - 1)}
              className="p-1 border rounded disabled:opacity-30 hover:bg-gray-200"
            >
              <ChevronLeft size={20}/>
            </button>
            <button
              disabled={paginaAtual === totalPaginas || totalPaginas === 0}
              onClick={() => setPaginaAtual(prev => prev + 1)}
              className="p-1 border rounded disabled:opacity-30 hover:bg-gray-200"
            >
              <ChevronRight size={20}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alocacao;