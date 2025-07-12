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

createRoot(document.getElementById("root")!).render(<App />);
