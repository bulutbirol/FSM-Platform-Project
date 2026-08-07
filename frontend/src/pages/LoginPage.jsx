import { ArrowLeft, LockKeyhole, Zap } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { apiMessage } from '../api/client'
import { Field } from '../components/ui'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { email: 'admin@serviceflow.demo', password: 'password' } })

  const submit = async (values) => {
    setError('')
    try {
      const user = await login(values.email, values.password)
      navigate(user.role === 'ADMIN' ? '/app/dashboard' : user.role === 'TECHNICIAN' ? '/app/work-orders' : '/app/requests')
    } catch (requestError) {
      setError(apiMessage(requestError))
    }
  }

  return (
    <main className="grid min-h-screen min-w-0 grid-cols-1 overflow-x-hidden bg-paper lg:grid-cols-[.9fr_1.1fr]">
      <section className="hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-3 font-display text-xl font-extrabold"><span className="grid h-10 w-10 place-items-center rounded-xl bg-mineral"><Zap size={20} fill="currentColor" /></span>ServiceFlow</Link>
        <div><p className="text-sm font-bold uppercase tracking-[.2em] text-blue-300">Operations, connected</p><h1 className="mt-5 max-w-lg font-display text-5xl font-extrabold leading-tight tracking-tight">A calm control room for every service job.</h1><p className="mt-5 max-w-md leading-7 text-slate-400">Move from the first customer call to completed field work without losing context.</p></div>
        <p className="text-xs text-slate-500">Field Service Management System</p>
      </section>
      <section className="grid min-w-0 place-items-center px-5 py-12">
        <div className="min-w-0 w-full max-w-md animate-rise">
          <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-ink"><ArrowLeft size={16} />Back to home</Link>
          <div className="mb-7 grid h-12 w-12 place-items-center rounded-2xl bg-blue-100 text-mineral"><LockKeyhole size={22} /></div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">Sign in with a ServiceFlow account.</p>
          {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>}
          <form className="mt-7 space-y-5" onSubmit={handleSubmit(submit)}>
            <Field label="Email" error={errors.email}><input className="input" type="email" autoComplete="email" {...register('email', { required: 'Email is required' })} /></Field>
            <Field label="Password" error={errors.password}><input className="input" type="password" autoComplete="current-password" {...register('password', { required: 'Password is required' })} /></Field>
            <button className="btn-primary w-full !py-3" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in'}</button>
          </form>
          <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-6 text-slate-500"><strong className="text-slate-700">Demo accounts</strong><br />Admin, technician, and customer accounts all use <code className="rounded bg-slate-100 px-1 py-0.5">password</code>. Use Try Demo for automatic admin access.</div>
        </div>
      </section>
    </main>
  )
}
