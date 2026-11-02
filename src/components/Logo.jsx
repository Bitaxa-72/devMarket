import { Link } from 'react-router-dom';

export function Logo() {
  return <Link className="logo" to="/" aria-label="Devmarket — на главную"><span className="logo__mark" aria-hidden="true">D</span><span className="logo__name">devmarket</span></Link>;
}
