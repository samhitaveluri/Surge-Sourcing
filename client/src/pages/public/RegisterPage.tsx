import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, ArrowRight, Lock, Mail, User, AlertCircle, ShoppingCart, Truck } from 'lucide-react';
import { Role } from '../../types';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['BUYER', 'SUPPLIER'], {
    errorMap: () => ({ message: 'Please select an account role' }),
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'BUYER',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    try {
      const user = await registerUser(data);
      if (user.role === 'BUYER') {
        navigate('/buyer/dashboard', { replace: true });
      } else {
        navigate('/supplier/dashboard', { replace: true });
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed. Please check your details.';
      setServerError(message);
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
          Create your business account
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-slate-200">
          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                I am registering as:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('role', 'BUYER')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    selectedRole === 'BUYER'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <ShoppingCart
                    className={`w-5 h-5 mb-2 ${
                      selectedRole === 'BUYER' ? 'text-indigo-600' : 'text-slate-400'
                    }`}
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900">Buyer</div>
                    <div className="text-xs text-slate-500 mt-0.5">Post RFQs & buy goods</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('role', 'SUPPLIER')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    selectedRole === 'SUPPLIER'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Truck
                    className={`w-5 h-5 mb-2 ${
                      selectedRole === 'SUPPLIER' ? 'text-indigo-600' : 'text-slate-400'
                    }`}
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900">Supplier</div>
                    <div className="text-xs text-slate-500 mt-0.5">Quote bids & supply</div>
                  </div>
                </button>
              </div>
              {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
            </div>

            {/* Business / Contact Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Company / Contact Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  {...register('name')}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg sm:text-sm focus:outline-none focus:ring-2 ${
                    errors.name
                      ? 'border-red-300 focus:ring-red-500 text-red-900'
                      : 'border-slate-300 focus:ring-indigo-500'
                  }`}
                  placeholder="Acme Industrial Corp"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Business Email
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
                      ? 'border-red-300 focus:ring-red-500 text-red-900'
                      : 'border-slate-300 focus:ring-indigo-500'
                  }`}
                  placeholder="procurement@acme.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            {/* Password */}
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
                  autoComplete="new-password"
                  {...register('password')}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg sm:text-sm focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-red-300 focus:ring-red-500 text-red-900'
                      : 'border-slate-300 focus:ring-indigo-500'
                  }`}
                  placeholder="Minimum 6 characters"
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
                  <span>Creating account...</span>
                ) : (
                  <>
                    <span>Create Account</span>
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
