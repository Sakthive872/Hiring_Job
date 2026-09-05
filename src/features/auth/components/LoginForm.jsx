// File: src/features/auth/components/LoginForm.jsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { login } from '../slice/authSlice';

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { requestStatus, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const update = (key) => (event) =>
    setForm({ ...form, [key]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result))
      navigate(location.state?.from?.pathname || '/', { replace: true });
  };
  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      {error ? (
        <p className="auth-form-error" role="alert">
          {error}
        </p>
      ) : null}
      <Input
        label="Work email"
        type="email"
        value={form.email}
        onChange={update('email')}
        autoComplete="email"
        required
      />
      <Input
        label="Password"
        type="password"
        value={form.password}
        onChange={update('password')}
        autoComplete="current-password"
        required
      />
      <Button
        type="submit"
        loading={requestStatus === 'loading'}
        disabled={!form.email || !form.password}
      >
        Sign in
      </Button>
      <p className="auth-switch">
        New to Workline? <Link to="/signup">Create an account</Link>
      </p>
    </form>
  );
}
