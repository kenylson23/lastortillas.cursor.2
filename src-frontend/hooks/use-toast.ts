// Versão simplificada do useToast para evitar erros
export function useToast() {
  return {
    toast: (options: any) => {
      console.log('Toast:', options);
      alert(options.description || options.title || 'Notificação');
    },
    toasts: []
  };
}