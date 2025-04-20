import { useCallback, useState } from 'react';
import { toast, type Id, type ToastContent, type ToastOptions } from 'react-toastify';

const useLoadingToast = () => {
  const [id, setId] = useState<Id>();
  
  const show = useCallback(<TData = unknown>(content: ToastContent<TData>, options?: ToastOptions<TData>): Id => {
    const id = toast.loading(content, options);
    
    setId(id);
    
    return id;
  }, []);
  
  const hide = useCallback(() => {
    toast.done(id);
    setId(undefined);
  }, [id]);
  
  return {id, show, hide};
}

export default useLoadingToast;