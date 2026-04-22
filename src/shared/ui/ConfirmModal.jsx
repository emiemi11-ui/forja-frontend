import { useState, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback((message, onOk) => {
    setState({ message, onOk });
  }, []);

  const close = () => setState(null);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {state && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={close}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--c-surface)', borderRadius: 16, padding: '28px 24px', maxWidth: 380, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', border: '1px solid var(--c-border)' }}>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 800, color: 'var(--c-ink)', marginBottom: 10 }}>Confirmare</div>
              <div style={{ fontSize: 14, color: 'var(--c-ink2)', lineHeight: 1.6, marginBottom: 24 }}>{state.message}</div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={close}
                  style={{ padding: '10px 24px', borderRadius: 10, border: '1.5px solid var(--c-border)', background: 'transparent', fontWeight: 700, fontSize: 13, cursor: 'pointer', color: 'var(--c-ink2)', fontFamily: 'var(--fb)' }}>
                  Anulează
                </button>
                <button onClick={() => { state.onOk?.(); close(); }}
                  style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'var(--c-coral)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--fb)' }}>
                  Da, confirmă
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}
