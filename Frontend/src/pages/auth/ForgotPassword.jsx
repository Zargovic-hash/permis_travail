import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { toast } from 'react-toastify';
import { Mail, ArrowLeft, CheckCircle, Send } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    
    if (!email) {
      setError('L\'email est requis');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Email invalide');
      return;
    }
    
    setLoading(true);
    
    try {
      await apiClient.post('/auth/forgot-password', { email });
      
      setSent(true);
      toast.success('Email envoyé ! Vérifiez votre boîte de réception.');
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Erreur lors de l\'envoi de l\'email';
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-30"></div>
                <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full p-4">
                  <CheckCircle className="w-12 h-12" />
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Email envoyé !
            </h2>
            
            <p className="text-slate-600 mb-2">
              Si l'email <strong className="text-slate-900">{email}</strong> est associé à un compte, vous recevrez un lien pour réinitialiser votre mot de passe dans quelques instants.
            </p>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-800">
                💡 Vérifiez également votre dossier spam/courrier indésirable.
              </p>
            </div>
            
            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-xl opacity-30"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-5 shadow-lg">
                <Send className="w-10 h-10" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Mot de passe oublié
          </h2>
          <p className="text-slate-600 text-sm">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className={`block w-full pl-11 pr-4 py-3 border ${
                    error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-900 placeholder-slate-400 bg-slate-50`}
                  placeholder="vous@exemple.com"
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </>
              ) : (
                'Envoyer le lien'
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la connexion
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-8">
          Version 1.0.0 • HSE Management System
        </p>
      </div>
    </div>
  );
}