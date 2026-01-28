import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/storage';
import { Files, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

const Landing: React.FC = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!login(email, password)) {
        setError('Invalid credentials. Please try again.');
      }
    } else {
      if (!name || !email || !password) {
        setError('All fields are required.');
        return;
      }
      const success = registerUser({ id: crypto.randomUUID(), email, name, password });
      if (success) {
        login(email, password);
      } else {
        setError('User already exists.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Hero Section */}
      <div className="lg:w-1/2 bg-brand-900 text-white p-8 lg:p-12 flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
             <Files className="w-8 h-8 text-orange-500" />
          </div>
          <span className="text-2xl font-bold tracking-tight">BRsMadeEasy</span>
        </div>

        <div className="my-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Automate Your <br/> <span className="text-orange-500">Board Resolutions</span>
          </h1>
          <p className="text-brand-100 text-lg mb-8 max-w-md">
            Draft compliant corporate resolutions in minutes. Secure, professional, and designed for Indian companies.
          </p>
          
          <div className="space-y-4">
             {[
               "Compliance with Companies Act, 2013",
               "Instant PDF/Word Generation",
               "Secure Cloud Storage",
               "AI-Powered Drafting Assistance"
             ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                   <CheckCircle2 className="w-5 h-5 text-orange-500" />
                   <span className="text-brand-50 font-medium">{feature}</span>
                </div>
             ))}
          </div>
        </div>

        <div className="text-sm text-brand-300">
           &copy; {new Date().getFullYear()} BRsMadeEasy LegalTech Solutions.
        </div>
      </div>

      {/* Auth Form Section */}
      <div className="lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
           <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-slate-900">
                {isLogin ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="mt-2 text-slate-600">
                {isLogin ? 'Enter your details to access your dashboard.' : 'Start drafting resolutions for free today.'}
              </p>
           </div>

           <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4" /> {error}
                </div>
              )}
              
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit" 
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
           </form>

           <div className="text-center mt-4">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-medium text-brand-600 hover:text-brand-500"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
           </div>
           
           <div className="bg-blue-50 p-4 rounded-lg flex gap-3 items-start text-xs text-blue-800">
             <Zap className="w-4 h-4 mt-0.5 shrink-0" />
             <p><strong>Demo Mode:</strong> No email verification required. Data is stored in your browser's local storage.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;