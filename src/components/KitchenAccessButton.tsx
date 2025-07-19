import { useLocation } from 'wouter';

export default function KitchenAccessButton({ className = '', size = 'normal' }: { 
  className?: string; 
  size?: 'small' | 'normal' | 'large' 
}) {
  const [, setLocation] = useLocation();

  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    normal: 'px-4 py-2 text-base', 
    large: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={() => setLocation('/cozinha')}
      className={`
        bg-orange-600 hover:bg-orange-700 
        text-white font-bold rounded-lg 
        transition-colors duration-200 
        flex items-center gap-2 shadow-md
        border-2 border-orange-400
        ${sizeClasses[size]}
        ${className}
      `}
      title="Acessar Painel da Cozinha"
    >
      <span className="text-lg">👨‍🍳</span>
      <span>COZINHA</span>
    </button>
  );
}