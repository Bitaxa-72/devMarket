import { ArrowLeft, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { authRequest } from '../lib/auth-api';
import { generatePassword } from '../utils/password';
import { FormMessage, PasswordGuide, PasswordInput } from './AuthFormFields';
import { TurnstileField } from './TurnstileField';

const modeContent = {
  login: { title: 'Вход', description: 'Введите email и пароль, указанные при регистрации.' },
  register: { title: 'Регистрация', description: 'Создайте аккаунт и подтвердите email по ссылке из письма.' },
  forgot: { title: 'Восстановление доступа', description: 'Отправим одноразовую ссылку для смены пароля на вашу почту.' },
  reset: { title: 'Новый пароль', description: 'Придумайте свой пароль или сгенерируйте надёжный.' },
};

function LoginForm({ onAuthenticated, onModeChange }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [website, setWebsite] = useState('');
  const [challengeKey, setChallengeKey] = useState(0);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setPending(true);
    try {
      const response = await authRequest('/login', { method: 'POST', body: JSON.stringify({ email, password, turnstileToken, website }) });
      onAuthenticated(response.user);
    } catch (requestError) {
      setError(requestError.message);
      setTurnstileToken('');
      setChallengeKey((current) => current + 1);
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={submit}>
      <label className="auth-form__field"><span>Email</span><input autoComplete="email" inputMode="email" name="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
      <PasswordInput autoComplete="current-password" labelAction={<button data-auth-mode="forgot" onClick={() => onModeChange('forgot')} type="button">Забыли пароль?</button>} name="password" onChange={(event) => setPassword(event.target.value)} value={password} />
      <TurnstileField action="login" onVerify={setTurnstileToken} onWebsiteChange={(event) => setWebsite(event.target.value)} resetKey={challengeKey} website={website} />
      <FormMessage error={error} />
      <button className="ui-button ui-button--primary auth-form__submit" disabled={pending || !turnstileToken} type="submit">{pending ? 'Входим…' : 'Войти'}</button>
    </form>
  );
}

function RegisterForm() {
  const [form, setForm] = useState({ firstName: '', email: '', password: '', confirmation: '' });
  const [result, setResult] = useState({ error: '', message: '' });
  const [pending, setPending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [website, setWebsite] = useState('');
  const [challengeKey, setChallengeKey] = useState(0);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const generate = () => {
    const password = generatePassword();
    setForm((current) => ({ ...current, password, confirmation: password }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmation) return setResult({ error: 'Пароли не совпадают', message: '' });
    setPending(true);
    setResult({ error: '', message: '' });
    try {
      const response = await authRequest('/register', { method: 'POST', body: JSON.stringify({ firstName: form.firstName, email: form.email, password: form.password, turnstileToken, website }) });
      setResult({ error: '', message: response.message });
    } catch (requestError) {
      setResult({ error: requestError.message, message: '' });
      setTurnstileToken('');
      setChallengeKey((current) => current + 1);
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={submit}>
      <label className="auth-form__field"><span>Имя</span><input autoComplete="given-name" maxLength={80} name="firstName" onChange={update} value={form.firstName} /></label>
      <label className="auth-form__field"><span>Email</span><input autoComplete="email" inputMode="email" name="email" onChange={update} required type="email" value={form.email} /></label>
      <PasswordInput autoComplete="new-password" name="password" onChange={update} value={form.password} />
      <PasswordGuide onGenerate={generate} password={form.password} />
      <PasswordInput autoComplete="new-password" label="Повторите пароль" name="confirmation" onChange={update} value={form.confirmation} />
      <TurnstileField action="register" onVerify={setTurnstileToken} onWebsiteChange={(event) => setWebsite(event.target.value)} resetKey={challengeKey} website={website} />
      <FormMessage error={result.error} message={result.message} />
      <button className="ui-button ui-button--primary auth-form__submit" disabled={pending || !turnstileToken} type="submit">{pending ? 'Создаём аккаунт…' : 'Создать аккаунт'}</button>
    </form>
  );
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState({ error: '', message: '' });
  const [pending, setPending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [website, setWebsite] = useState('');
  const [challengeKey, setChallengeKey] = useState(0);

  const submit = async (event) => {
    event.preventDefault();
    setPending(true);
    setResult({ error: '', message: '' });
    try {
      const response = await authRequest('/forgot-password', { method: 'POST', body: JSON.stringify({ email, turnstileToken, website }) });
      setResult({ error: '', message: response.message });
    } catch (requestError) {
      setResult({ error: requestError.message, message: '' });
      setTurnstileToken('');
      setChallengeKey((current) => current + 1);
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={submit}>
      <label className="auth-form__field"><span>Email</span><input autoComplete="email" inputMode="email" name="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
      <TurnstileField action="forgot_password" onVerify={setTurnstileToken} onWebsiteChange={(event) => setWebsite(event.target.value)} resetKey={challengeKey} website={website} />
      <FormMessage error={result.error} message={result.message} />
      <button className="ui-button ui-button--primary auth-form__submit" disabled={pending || !turnstileToken} type="submit">{pending ? 'Отправляем…' : 'Получить ссылку'}</button>
    </form>
  );
}

function ResetPasswordForm({ onModeChange, token }) {
  const [form, setForm] = useState({ password: '', confirmation: '' });
  const [result, setResult] = useState({ error: '', message: '' });
  const [pending, setPending] = useState(false);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const generate = () => {
    const password = generatePassword();
    setForm({ password, confirmation: password });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!token) return setResult({ error: 'В ссылке отсутствует код восстановления', message: '' });
    if (form.password !== form.confirmation) return setResult({ error: 'Пароли не совпадают', message: '' });
    setPending(true);
    setResult({ error: '', message: '' });
    try {
      const response = await authRequest('/reset-password', { method: 'POST', body: JSON.stringify({ token, password: form.password }) });
      setResult({ error: '', message: response.message });
    } catch (requestError) {
      setResult({ error: requestError.message, message: '' });
    } finally {
      setPending(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-form auth-form--status">
        <FormMessage error="Ссылка недействительна. Запросите новое письмо восстановления." />
        <button className="ui-button ui-button--primary auth-form__submit" onClick={() => onModeChange('forgot')} type="button">Запросить новую ссылку</button>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <PasswordInput autoComplete="new-password" label="Новый пароль" name="password" onChange={update} value={form.password} />
      <PasswordGuide onGenerate={generate} password={form.password} />
      <PasswordInput autoComplete="new-password" label="Повторите новый пароль" name="confirmation" onChange={update} value={form.confirmation} />
      <FormMessage error={result.error} message={result.message} />
      <button className="ui-button ui-button--primary auth-form__submit" disabled={pending} type="submit">{pending ? 'Сохраняем…' : 'Сохранить пароль'}</button>
    </form>
  );
}

export function AuthModal({ initialMode = 'login', isOpen, onAuthenticated, onClose, resetToken = '' }) {
  const [mode, setMode] = useState(initialMode);
  const dialogRef = useRef(null);
  const content = modeContent[mode];

  useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = window.requestAnimationFrame(() => dialogRef.current?.querySelector('input')?.focus());
    const closeOnEscape = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.cancelAnimationFrame(frame);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [initialMode, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="auth-modal" role="presentation" onMouseDown={onClose}>
      <section className="auth-modal__dialog" ref={dialogRef} aria-labelledby="auth-modal-title" aria-modal="true" role="dialog" onMouseDown={(event) => event.stopPropagation()}>
        <div className="auth-modal__controls">
          {mode === 'forgot' || mode === 'reset' ? (
            <button className="auth-modal__back" data-auth-mode="login" onClick={() => setMode('login')} type="button"><ArrowLeft size={16} />Вернуться ко входу</button>
          ) : (
            <div className="auth-modal__tabs" aria-label="Способ авторизации">
              <button className={mode === 'login' ? 'auth-modal__tab auth-modal__tab--active' : 'auth-modal__tab'} data-auth-mode="login" onClick={() => setMode('login')} type="button">Вход</button>
              <button className={mode === 'register' ? 'auth-modal__tab auth-modal__tab--active' : 'auth-modal__tab'} data-auth-mode="register" onClick={() => setMode('register')} type="button">Регистрация</button>
            </div>
          )}
          <button className="auth-modal__close" type="button" aria-label="Закрыть" onClick={onClose}><X size={20} /></button>
        </div>
        <h2 className="auth-modal__title" id="auth-modal-title">{content.title}</h2>
        <p className="auth-modal__description">{content.description}</p>
        {mode === 'login' && <LoginForm onAuthenticated={onAuthenticated} onModeChange={setMode} />}
        {mode === 'register' && <RegisterForm />}
        {mode === 'forgot' && <ForgotPasswordForm />}
        {mode === 'reset' && <ResetPasswordForm onModeChange={setMode} token={resetToken} />}
      </section>
    </div>
  );
}
