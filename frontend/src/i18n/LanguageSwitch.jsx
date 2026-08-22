import { Languages } from 'lucide-react'
import { useLanguage } from './LanguageContext'

export function LanguageSwitch({ inverse = false }) {
  const { language, setLanguage } = useLanguage()
  const shell = inverse ? 'border-white/15 bg-white/10 text-white' : 'border-slate-200 bg-white text-slate-600'
  const inactive = inverse ? 'text-slate-300 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'

  return (
    <div className={`inline-flex items-center gap-1 rounded-xl border p-1 ${shell}`} aria-label="Language selection">
      <Languages size={14} className="mx-1 hidden sm:block" aria-hidden="true" />
      <button type="button" aria-label="Türkçe" aria-pressed={language === 'tr'} className={`rounded-lg px-2 py-1 text-[11px] font-extrabold ${language === 'tr' ? 'bg-saffron text-ink' : inactive}`} onClick={() => setLanguage('tr')}>TR</button>
      <button type="button" aria-label="English" aria-pressed={language === 'en'} className={`rounded-lg px-2 py-1 text-[11px] font-extrabold ${language === 'en' ? 'bg-mineral text-white' : inactive}`} onClick={() => setLanguage('en')}>EN</button>
    </div>
  )
}
