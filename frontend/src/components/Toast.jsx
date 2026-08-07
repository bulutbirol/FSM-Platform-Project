import { createContext, useContext, useMemo, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const showToast = (message, tone = 'success') => {
    setToast({ message, tone })
    window.setTimeout(() => setToast(null), 3500)
  }
  const value = useMemo(() => ({ showToast }), [])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[70] flex max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 shadow-panel ${toast.tone === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-white text-emerald-800'}`} role="status">
          <CheckCircle2 size={18} />
          <span className="text-sm font-semibold">{toast.message}</span>
          <button onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={16} /></button>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

