import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ValidationFlow } from './pages/ValidationFlow';
import { AgentWorkflow } from './pages/AgentWorkflow';
import ProviderValidation from './pages/ProviderValidation';
import MultiSourceValidation from './pages/MultiSourceValidation';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/flow" element={<Layout><ValidationFlow /></Layout>} />
        <Route path="/workflow" element={<AgentWorkflow />} />
        <Route path="/validation" element={<Layout><ProviderValidation /></Layout>} />
        <Route path="/multi-validation" element={<Layout><MultiSourceValidation /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
