import { Check, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthTabs } from '../components/AuthTabs';
import { TurnstileField } from '../components/TurnstileField';
import { authRequest } from '../lib/auth-api';
import { getAccountUrl } from '../lib/site-urls';
import {
  generatePassword,
  getPasswordRequirements,
  getPasswordStrength,
} from '../utils/password';

function AuthLayout({ title, description, children, tabs = false }) {
  return (
    <main className="auth-page">
      <section className="auth-page__visual">
        <span className="auth-page__badge">D</span>
        <h1>Управляйте проектами в одном месте</h1>
        <p>Заказы, документы, статусы работ и общение с командой.</p>
        <div className="auth-page__benefits">
          <span><Check size={17} />История заказов</span>
          <span><Check size={17} />Документы и оплаты</span>
          <span><Check size={17} />Прямой чат</span>
        </div>
      </section>
      <section className="auth-page__form-wrap">
        <div className="auth-page__form">
          {tabs ? <AuthTabs /> : <span className="auth-page__eyebrow">Личный кабинет</span>}
          <h2>{title}</h2>
          <p>{description}</p>
          {children}
        </div>
      </section>
    </main>
  );
}

function PasswordInput({ autoComplete, name, value, onChange, label = 'Пароль', labelAction }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-form__field">
      <label htmlFor={name}>{label}</label>
      <span className="auth-form__password">
        <input
          autoComplete={autoComplete}
          maxLength={128}
          minLength={12}
          id={name}
          name={name}
          onChange={onChange}
          required
          type={visible ? 'text' : 'password'}
          value={value}
        />
        <button
          aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
      {labelAction && <span className="auth-form__field-action">{labelAction}</span>}
    </div>
  );
}

function PasswordGuide({ password, onGenerate }) {
  const strength = getPasswordStrength(password);
  const requirements = getPasswordRequirements(password);
  const meetsAllRequirements = Object.values(requirements).every(Boolean);
  const hint = !requirements.length
    ? 'Минимум 12 символов.'
    : meetsAllRequirements
      ? 'Пароль соответствует требованиям.'
      : 'Добавьте заглавную букву, цифру и символ для усиления.';

  return (
    <div className="password-guide">
      <div className="password-guide__heading">
        <span>Надёжность: {strength.label}</span>
        <button onClick={onGenerate} type="button">
          <RefreshCw size={14} />Сгенерировать
        </button>
      </div>
      <div className="password-guide__meter" aria-hidden="true">
        {[1, 2, 3, 4].map((level) => (
          <span
            className={strength.level >= level ? 'password-guide__bar password-guide__bar--active' : 'password-guide__bar'}
            key={level}
          />
        ))}
      </div>
      <p className="password-guide__hint">{hint}</p>
    </div>
  );
}

function FormMessage({ error, message }) {
  if (!error && !message) return null;
  return (
    <p className={error ? 'auth-form__message auth-form__message--error' : 'auth-form__message auth-form__message--success'} role="status">
      {error || message}
    </p>
  );
}

export function LoginPage() {
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
      await authRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, turnstileToken, website }),
      });
      window.location.assign(getAccountUrl('/account'));
    } catch (requestError) {
      setError(requestError.message);
      setTurnstileToken('');
      setChallengeKey((current) => current + 1);
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout tabs title="Вход" description="Введите email и пароль, указанные при регистрации.">
      <form className="auth-form" onSubmit={submit}>
        <label className="auth-form__field">
          <span>Email</span>
          <input autoComplete="email" inputMode="email" name="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        </label>
        <PasswordInput autoComplete="current-password" labelAction={<Link to="/forgot-password">Забыли пароль?</Link>} name="password" onChange={(event) => setPassword(event.target.value)} value={password} />
        <TurnstileField action="login" onVerify={setTurnstileToken} onWebsiteChange={(event) => setWebsite(event.target.value)} resetKey={challengeKey} website={website} />
        <FormMessage error={error} />
        <button className="ui-button ui-button--primary auth-form__submit" disabled={pending || !turnstileToken} type="submit">
          {pending ? 'Входим…' : 'Войти'}
        </button>
      </form>
    </AuthLayout>
  );
}

export function RegisterPage() {
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
    if (form.password !== form.confirmation) {
      setResult({ error: 'Пароли не совпадают', message: '' });
      return;
    }
    setPending(true);
    setResult({ error: '', message: '' });
    try {
      const response = await authRequest('/register', {
        method: 'POST',
        body: JSON.stringify({ firstName: form.firstName, email: form.email, password: form.password, turnstileToken, website }),
      });
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
    <AuthLayout tabs title="Регистрация" description="Создайте аккаунт и подтвердите email по ссылке из письма.">
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
    </AuthLayout>
  );
}

export function ForgotPasswordPage() {
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
    <AuthLayout title="Восстановление доступа" description="Отправим одноразовую ссылку для смены пароля на вашу почту.">
      <form className="auth-form" onSubmit={submit}>
        <label className="auth-form__field"><span>Email</span><input autoComplete="email" inputMode="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
        <TurnstileField action="forgot_password" onVerify={setTurnstileToken} onWebsiteChange={(event) => setWebsite(event.target.value)} resetKey={challengeKey} website={website} />
        <FormMessage error={result.error} message={result.message} />
        <button className="ui-button ui-button--primary auth-form__submit" disabled={pending || !turnstileToken} type="submit">{pending ? 'Отправляем…' : 'Получить ссылку'}</button>
      </form>
      <div className="auth-page__links"><Link to="/login">Вернуться ко входу</Link></div>
    </AuthLayout>
  );
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ password: '', confirmation: '' });
  const [result, setResult] = useState({ error: '', message: '' });
  const [pending, setPending] = useState(false);
  const token = searchParams.get('token') || '';
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

  return (
    <AuthLayout title="Новый пароль" description="Придумайте свой пароль или сгенерируйте надёжный.">
      <form className="auth-form" onSubmit={submit}>
        <PasswordInput autoComplete="new-password" label="Новый пароль" name="password" onChange={update} value={form.password} />
        <PasswordGuide onGenerate={generate} password={form.password} />
        <PasswordInput autoComplete="new-password" label="Повторите пароль" name="confirmation" onChange={update} value={form.confirmation} />
        <FormMessage error={result.error} message={result.message} />
        <button className="ui-button ui-button--primary auth-form__submit" disabled={pending} type="submit">{pending ? 'Сохраняем…' : 'Сохранить пароль'}</button>
      </form>
      <div className="auth-page__links"><Link to="/login">Перейти ко входу</Link></div>
    </AuthLayout>
  );
}

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState({ error: '', message: 'Подтверждаем email…' });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = searchParams.get('token') || '';
    if (!token) {
      setResult({ error: 'В ссылке отсутствует код подтверждения', message: '' });
      return;
    }
    authRequest('/verify-email', { method: 'POST', body: JSON.stringify({ token }) })
      .then((response) => setResult({ error: '', message: response.message }))
      .catch((requestError) => setResult({ error: requestError.message, message: '' }));
  }, [searchParams]);

  return (
    <AuthLayout title="Подтверждение email" description="Проверяем одноразовую ссылку из письма.">
      <div className="auth-form auth-form--status"><FormMessage error={result.error} message={result.message} /></div>
      <div className="auth-page__links"><Link to="/login">Перейти ко входу</Link></div>
    </AuthLayout>
  );
}
