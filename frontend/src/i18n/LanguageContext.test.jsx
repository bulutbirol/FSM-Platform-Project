import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageProvider, translate, useLanguage } from './LanguageContext'
import { LanguageSwitch } from './LanguageSwitch'

function Probe() {
  const { language, t, statusLabel, roleLabel, priorityLabel } = useLanguage()

  return (
    <div>
      <span data-testid="language">{language}</span>
      <span>{t('Dashboard')}</span>
      <span>{statusLabel('IN_PROGRESS')}</span>
      <span>{roleLabel('TECHNICIAN')}</span>
      <span>{priorityLabel('URGENT')}</span>
      <LanguageSwitch />
    </div>
  )
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.lang = ''
})

test('uses Turkish by default and localizes workflow labels', () => {
  render(<LanguageProvider><Probe /></LanguageProvider>)

  expect(screen.getByTestId('language')).toHaveTextContent('tr')
  expect(screen.getByText('Kontrol paneli')).toBeInTheDocument()
  expect(screen.getByText('Devam ediyor')).toBeInTheDocument()
  expect(screen.getByText('Teknisyen')).toBeInTheDocument()
  expect(screen.getByText('Acil')).toBeInTheDocument()
  expect(document.documentElement.lang).toBe('tr')
})

test('switches to English and remembers the selection', async () => {
  const user = userEvent.setup()
  render(<LanguageProvider><Probe /></LanguageProvider>)

  await user.click(screen.getByRole('button', { name: 'English' }))

  expect(screen.getByTestId('language')).toHaveTextContent('en')
  expect(screen.getByText('Dashboard')).toBeInTheDocument()
  expect(screen.getByText('In progress')).toBeInTheDocument()
  expect(localStorage.getItem('serviceflow_language')).toBe('en')
  expect(document.documentElement.lang).toBe('en')
})

test('localizes messages returned by the API', () => {
  expect(translate('Invalid email or password.', 'tr')).toBe('E-posta veya şifre hatalı.')
  expect(translate('must not be blank', 'tr')).toBe('Bu alan boş bırakılamaz')
})
