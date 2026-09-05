// File: src/features/auth/components/SignupForm.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import RoleSelector from './RoleSelector';
import { signup } from '../slice/authSlice';

export default function SignupForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { requestStatus, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });
  const update = (key) => (value) =>
    setForm({ ...form, [key]: value?.target ? value.target.value : value });
  const submit = async (event) => {
    event.preventDefault();
    const result = await dispatch(signup(form));
    if (signup.fulfilled.match(result)) navigate('/', { replace: true });
  };
  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <Input
        label="Full name"
        value={form.name}
        onChange={update('name')}
        autoComplete="name"
        required
      />
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
        autoComplete="new-password"
        required
        hint="Use at least 8 characters."
      />
      <RoleSelector value={form.role} onChange={update('role')} error={error} />
      <Button
        type="submit"
        loading={requestStatus === 'loading'}
        disabled={!form.name || !form.email || !form.password || !form.role}
      >
        Create account
      </Button>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </form>
  );
}
