import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { getPasswordRequirements, getPasswordStrength } from '../utils/password';

export function PasswordInput({ autoComplete, name, value, onChange, label = 'Пароль', labelAction }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-form__field">
      <label htmlFor={name}>{label}</label>
      <span className="auth-form__password">
        <input autoComplete={autoComplete} id={name} maxLength={128} minLength={12} name={name} onChange={onChange} required type={visible ? 'text' : 'password'} value={value} />
        <button aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'} onClick={() => setVisible((current) => !current)} type="button">
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
      {labelAction && <span className="auth-form__field-action">{labelAction}</span>}
    </div>
  );
}

export function PasswordGuide({ password, onGenerate }) {
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
        <button onClick={onGenerate} type="button"><RefreshCw size={14} />Сгенерировать</button>
      </div>
      <div className="password-guide__meter" aria-hidden="true">
        {[1, 2, 3, 4].map((level) => <span className={strength.level >= level ? 'password-guide__bar password-guide__bar--active' : 'password-guide__bar'} key={level} />)}
      </div>
      <p className="password-guide__hint">{hint}</p>
    </div>
  );
}

export function FormMessage({ error, message }) {
  if (!error && !message) return null;
  return <p className={error ? 'auth-form__message auth-form__message--error' : 'auth-form__message auth-form__message--success'} role="status">{error || message}</p>;
}
