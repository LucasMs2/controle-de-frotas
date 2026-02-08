import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Motorista from './pages/Motorista';
import logo from './assets/logo.png';
import Onibus from './pages/Onibus';
import Alocacoes from './pages/Alocacoes';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Header*/}
        <header className="bg-[#1a2b56] text-white shadow-lg">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">

            {/* Logo */}
            <div className="flex items-center">
              <Link to="/">
                <img src={logo} alt="Logo Amparo" className="h-14 w-auto object-contain" />
              </Link>
            </div>

            {/* Menu */}
            <nav className="flex space-x-8 items-center text-sm font-semibold uppercase tracking-wide">
              <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
              <Link to="/motoristas" className="hover:text-blue-400 transition-colors">Motoristas</Link>
              <Link to="/onibus" className="hover:text-blue-400 transition-colors">Ônibus</Link>
              <Link to="/alocacoes" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 transition-all shadow-md">
                Gestão de Frotas
              </Link>
            </nav>

          </div>
        </header>

        {/* Banner*/}
        <div className="bg-[#0071ce] py-12 border-b-4 border-yellow-400">
          <div className="container mx-auto px-6 text-center"> {/* Adicionado text-center aqui */}
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              TESTE TÉCNICO - <br />
              <span className="text-yellow-400">SISTEMA DE GESTÃO DE FROTAS</span>
            </h1>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <main className="container mx-auto px-6 -mt-8">
          <div className="bg-white rounded-lg shadow-2xl p-8 min-h-[500px]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/motoristas" element={<Motorista />} />
              <Route path="/onibus" element={<Onibus />} />
              <Route path="/alocacoes" element={<Alocacoes />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

const Home = () => (
  <div className="text-center py-20">
    <h2 className="text-3xl font-bold text-gray-800">Sistema de Gestão de Frotas</h2>
    <p className="text-gray-600 mt-4">Selecione uma categoria no menu superior para iniciar a operação.</p>
  </div>
);

export default App;