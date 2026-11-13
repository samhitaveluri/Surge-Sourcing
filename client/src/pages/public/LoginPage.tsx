import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, ArrowRight, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      const user = await login(data.email, data.password);
      if (user.role === 'BUYER') {
        navigate('/buyer/dashboard', { replace: true });
      } else {
        navigate('/supplier/dashboard', { replace: true });
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setServerError(message);
    }
  };

  const handleQuickFill = (role: 'BUYER' | 'SUPPLIER') => {
    if (role === 'BUYER') {
      setValue('email', 'buyer@example.com');
      setValue('password', 'Password123!');
    } else {
      setValue('email', 'supplier@example.com');
      setValue('password', 'Password123!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2.5 font-bold text-slate-900 text-2xl">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Building2 className="w-6 h-6" />
          </div>
          <span>RFQ Marketplace</span>
        </Link>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Or{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-slate-200">
          {/* Quick Demo Fill Pill */}
          <div className="mb-6 p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs">
            <div className="flex items-center text-indigo-800 font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
              Quick Fill Demo Credentials:
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('BUYER')}
                className="flex-1 py-1.5 px-2 bg-white rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors font-medium text-center"
              >
                Buyer (Apex Ltd)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('SUPPLIER')}
                className="flex-1 py-1.5 px-2 bg-white rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors font-medium text-center"
              >
                Supplier (Global Furn.)
              </button>
            </div>
          </div>

          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg sm:text-sm focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500 text-red-900'
                      : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg sm:text-sm focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500 text-red-900'
                      : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
