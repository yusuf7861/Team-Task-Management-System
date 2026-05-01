import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { data } = await authApi.signup({
        name,
        email,
        password,
        role: 'MEMBER', // Only MEMBER can register through the frontend
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      }));
      // Members always go to dashboard
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-md w-full">
      <main className="w-full max-w-md bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-xl">
        {/* Header */}
        <div className="text-center mb-xl">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 text-primary hover:text-on-primary-fixed-variant transition-colors">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-lg">E</div>
            <span className="font-h3 text-h3">Ethara</span>
          </Link>
          <h1 className="font-h2 text-h2 text-on-surface mb-sm">Create your account</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Join your team and start managing tasks.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-md p-md bg-error-container text-on-error-container rounded-lg font-body-sm text-body-sm flex items-center gap-sm">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-lg" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="space-y-sm">
            <label className="block font-label-caps text-label-caps text-on-surface uppercase" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </div>
              <input
                className="block w-full pl-xl pr-md py-[10px] bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
                id="name"
                name="name"
                placeholder="John Doe"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-sm">
            <label className="block font-label-caps text-label-caps text-on-surface uppercase" htmlFor="reg-email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </div>
              <input
                className="block w-full pl-xl pr-md py-[10px] bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
                id="reg-email"
                name="email"
                placeholder="name@company.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-sm">
            <label className="block font-label-caps text-label-caps text-on-surface uppercase" htmlFor="reg-password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <input
                className="block w-full pl-xl pr-md py-[10px] bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
                id="reg-password"
                name="password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-sm">
            <label className="block font-label-caps text-label-caps text-on-surface uppercase" htmlFor="confirm-password">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <input
                className="block w-full pl-xl pr-md py-[10px] bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
                id="confirm-password"
                name="confirmPassword"
                placeholder="••••••••"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Role Indicator */}
          <div className="flex items-center gap-sm p-md bg-surface-container-low rounded-lg border border-outline-variant">
            <span className="material-symbols-outlined text-[18px] text-primary">badge</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              You will be registered as a <span className="font-medium text-primary">Team Member</span>
            </span>
          </div>

          <button
            className="w-full flex justify-center items-center py-[10px] px-md bg-primary-container text-on-primary rounded-lg font-button text-button hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-container disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-sm">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Creating Account...
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-lg text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link className="text-primary font-medium hover:text-primary-container transition-colors" to="/login">
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;
