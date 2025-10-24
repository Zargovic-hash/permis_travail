import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { toast } from 'react-toastify';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      toast.error('Token manquant ou invalide');
    }
  }, [token]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const getPasswordStrengthLabel = (strength) => {
    const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
    return labels[strength] || '';
  };

  const getPasswordStrengthColor = (strength) => {
    const colors = ['bg-danger-500', 'bg-warning-500', 'bg-warning-400', 'bg-success-500', 'bg-success-600'];
    return colors[strength] || 'bg-gray-300';
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('Minimum 8 caractères');
    if (!/[A-Z]/.test(password)) errors.push('Une majuscule');
    if (!/[a-z]/.test(password)) errors.push('Une minuscule');
    if (!/[0-9]/.test(password)) errors.push('Un chiffre');
    return errors;
  };

  const validateForm = () => {
    const newErrors = {};
    
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      newErrors.password = `Le mot de passe doit contenir : ${passwordErrors.join(', ')}`;
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }
    
    setLoading(true);
    
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        nouveau_mot_de_passe: formData.password
      });
      
      toast.success('Mot de passe réinitialisé avec succès !');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Erreur lors de la réinitialisation du mot de passe';
      
      toast.error(errorMessage);
      
      if (errorMessage.includes('token') || errorMessage.includes('expiré')) {
        setTokenValid(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-danger-100 text-danger-600 rounded-full p-4">
                <AlertCircle className="w-12 h-12" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Lien invalide ou expiré
            </h2>
            
            <p className="text-gray-600 mb-6">
              Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.
            </p>
            
            <div className="space-y-3">
              <Link
                to="/forgot-password"
                className="block w-full py-2.5 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
              >
                Demander un nouveau lien
              </Link>
              
              <Link
                to="/login"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-primary-600 text-white rounded-full p-4">
              <Lock className="w-8 h-8" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Nouveau mot de passe
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg" onSubmit={handleSubmit}>
          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`block w-full pl-10 pr-10 py-2.5 border ${
                  errors.password ? 'border-danger-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">
                    {getPasswordStrengthLabel(passwordStrength)}
                  </span>
                </div>
              </div>
            )}
            
            {errors.password && (
              <p className="mt-1 text-sm text-danger-600">{errors.password}</p>
            )}
            
            {/* Password Requirements */}
            <div className="mt-3 space-y-1">
              <div className={`flex items-center text-xs ${formData.password.length >= 8 ? 'text-success-600' : 'text-gray-500'}`}>
                {formData.password.length >= 8 ? (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                ) : (
                  <div className="w-3 h-3 mr-1 rounded-full border border-gray-300" />
                )}
                Au moins 8 caractères
              </div>
              <div className={`flex items-center text-xs ${/[A-Z]/.test(formData.password) ? 'text-success-600' : 'text-gray-500'}`}>
                {/[A-Z]/.test(formData.password) ? (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                ) : (
                  <div className="w-3 h-3 mr-1 rounded-full border border-gray-300" />
                )}
                Une lettre majuscule
              </div>
              <div className={`flex items-center text-xs ${/[a-z]/.test(formData.password) ? 'text-success-600' : 'text-gray-500'}`}>
                {/[a-z]/.test(formData.password) ? (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                ) : (
                  <div className="w-3 h-3 mr-1 rounded-full border border-gray-300" />
                )}
                Une lettre minuscule
              </div>
              <div className={`flex items-center text-xs ${/[0-9]/.test(formData.password) ? 'text-success-600' : 'text-gray-500'}`}>
                {/[0-9]/.test(formData.password) ? (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                ) : (
                  <div className="w-3 h-3 mr-1 rounded-full border border-gray-300" />
                )}
                Un chiffre
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`block w-full pl-10 pr-10 py-2.5 border ${
                  errors.confirmPassword ? 'border-danger-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-danger-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Réinitialisation...
                </>
              ) : (
                'Réinitialiser le mot de passe'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}