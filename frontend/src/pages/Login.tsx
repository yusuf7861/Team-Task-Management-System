import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await authApi.login({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      }));
      // Role-based redirect
      if (data.role === 'ADMIN') {
        navigate('/app/dashboard');
      } else {
        navigate('/app/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
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
          <h1 className="font-h2 text-h2 text-on-surface mb-sm">Welcome back</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Sign in to your account to continue.
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
          <div className="space-y-sm">
            <label className="block font-label-caps text-label-caps text-on-surface uppercase" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </div>
              <input 
                className="block w-full pl-xl pr-md py-[10px] bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors" 
                id="email" 
                name="email" 
                placeholder="name@company.com" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-sm">
            <div className="flex justify-between items-center">
              <label className="block font-label-caps text-label-caps text-on-surface uppercase" htmlFor="password">
                Password
              </label>
              <a className="font-body-sm text-body-sm text-primary hover:text-primary-container transition-colors" href="#">
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <input 
                className="block w-full pl-xl pr-md py-[10px] bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors" 
                id="password" 
                name="password" 
                placeholder="••••••••" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
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
                Signing In...
              </span>
            ) : 'Sign In'}
          </button>
        </form>
        
        {/* Footer */}
        <div className="mt-lg text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Don't have an account?{' '}
            <Link className="text-primary font-medium hover:text-primary-container transition-colors" to="/register">
              Register
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
