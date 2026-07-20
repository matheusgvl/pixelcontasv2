import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import OnboardingLayout from './layouts/OnboardingLayout';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import RecuperarSenha from './pages/RecuperarSenha';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import EmitirNota from './pages/EmitirNota';
import GestaoNotas from './pages/GestaoNotas';
import DetalhesNota from './pages/DetalhesNota';
import Clientes from './pages/Clientes';
import ProdutosServicos from './pages/ProdutosServicos';
import Integracoes from './pages/Integracoes';
import Automacoes from './pages/Automacoes';
import Relatorios from './pages/Relatorios';
import DocumentosPendencias from './pages/DocumentosPendencias';
import Contabilidade from './pages/Contabilidade';
import Configuracoes from './pages/Configuracoes';
import Plano from './pages/Plano';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          </Route>

          {/* Onboarding Routes */}
          <Route element={<OnboardingLayout />}>
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>

          {/* Authenticated Workspace Routes */}
          <Route path="/app" element={<AuthenticatedLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="emitir-nota" element={<EmitirNota />} />
            <Route path="notas" element={<GestaoNotas />} />
            <Route path="notas/:id" element={<DetalhesNota />} />
            
            {/* Clientes views mapped to unified component */}
            <Route path="clientes" element={<Clientes />} />
            <Route path="clientes/novo" element={<Clientes />} />
            <Route path="clientes/:id" element={<Clientes />} />

            {/* Catalogs mapped to unified tabbed component */}
            <Route path="produtos" element={<ProdutosServicos />} />
            <Route path="servicos" element={<ProdutosServicos />} />

            {/* Integracoes */}
            <Route path="integracoes" element={<Integracoes />} />
            <Route path="integracoes/:id" element={<Integracoes />} />

            {/* Automacoes */}
            <Route path="automacoes" element={<Automacoes />} />
            <Route path="automacoes/nova" element={<Automacoes />} />

            {/* Relatorios */}
            <Route path="relatorios" element={<Relatorios />} />

            {/* Documentos & Pendencias mapped to unified component */}
            <Route path="documentos" element={<DocumentosPendencias />} />
            <Route path="pendencias" element={<DocumentosPendencias />} />

            {/* Contabilidade */}
            <Route path="contabilidade" element={<Contabilidade />} />

            {/* Team config shortcuts */}
            <Route path="usuarios" element={<Configuracoes />} />
            <Route path="configuracoes" element={<Configuracoes />} />

            {/* Billing Plan */}
            <Route path="plano" element={<Plano />} />
          </Route>

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
};
export default App;
