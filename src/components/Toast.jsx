import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uiActions } from '../redux-state/UiState.js';
import { FiCheck } from 'react-icons/fi';

// Single lightweight toast, auto-dismissed after 2.4s.
const Toast = () => {
  const toast = useSelector((state) => state.ui.toast);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => dispatch(uiActions.clearToast()), 2400);
    return () => clearTimeout(t);
  }, [toast, dispatch]);

  if (!toast) return null;

  return (
    <div className="toast-stack">
      <div className="toast" key={toast.id} role="status" aria-live="polite">
        <FiCheck size={17} />
        <span>{toast.message}</span>
      </div>
    </div>
  );
};

export default Toast;
