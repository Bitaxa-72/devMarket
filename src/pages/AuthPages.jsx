import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FormMessage, PasswordGuide, PasswordInput } from '../components/AuthFormFields';
import { authRequest } from '../lib/auth-api';
import { generatePassword } from '../utils/password';

function AuthLayout({ title, description, children }) {
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
          <h2>{title}</h2>
          <p>{description}</p>
          {children}
        </div>
      </section>
    </main>
  );
}

function InvalidResetLink() {
  return (
    <AuthLayout title="Ссылка недействительна" description="В адресе нет кода восстановления. Запросите новое письмо и откройте ссылку из него целиком.">
      <div className="auth-session-state auth-session-state--invalid">Поля нового пароля доступны только по персональной ссылке из письма.</div>
      <Link className="ui-button ui-button--primary auth-session-state__action" to="/?auth=forgot">Запросить новую ссылку</Link>
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

  if (!token) return <InvalidResetLink />;

  const submit = async (event) => {
    event.preventDefault();
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
        <PasswordInput autoComplete="new-password" label="Повторите новый пароль" name="confirmation" onChange={update} value={form.confirmation} />
        <FormMessage error={result.error} message={result.message} />
        <button className="ui-button ui-button--primary auth-form__submit" disabled={pending} type="submit">{pending ? 'Сохраняем…' : 'Сохранить пароль'}</button>
      </form>
      <div className="auth-page__links"><Link to="/?auth=login">Перейти ко входу</Link></div>
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
      <div className="auth-page__links"><Link to="/?auth=login">Перейти ко входу</Link></div>
    </AuthLayout>
  );
}
