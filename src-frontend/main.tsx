import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/performance.css";

// Preload recursos críticos
const criticalResources = [
  'https://images.unsplash.com',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com'
];

// Adicionar resource hints
criticalResources.forEach((resource) => {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = resource;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
});

// Função para renderizar com tratamento de erro
const renderApp = () => {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Elemento root não encontrado");
    }
    
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error) {
    console.error("Erro ao renderizar aplicação:", error);
    
    // Fallback para usuário
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          height: 100vh; 
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 20px;
        ">
          <h1 style="color: #dc2626; margin-bottom: 20px;">Las Tortillas Mexican Grill</h1>
          <p style="color: #6b7280; margin-bottom: 20px;">
            Ocorreu um erro ao carregar a aplicação.
          </p>
          <button 
            onclick="window.location.reload()" 
            style="
              background: #dc2626; 
              color: white; 
              border: none; 
              padding: 12px 24px; 
              border-radius: 8px; 
              cursor: pointer;
              font-size: 16px;
            "
          >
            Tentar Novamente
          </button>
        </div>
      `;
    }
  }
};

// Renderizar aplicação
renderApp();
