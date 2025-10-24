import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold text-primary-600">404</h1>
          <div className="text-2xl font-bold text-gray-900 mt-4">Page non trouvée</div>
          <p className="text-gray-600 mt-2">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full py-3 px-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Retour à l'accueil
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center w-full py-3 px-6 bg-white text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors border border-gray-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Page précédente
          </button>
        </div>
      </div>
    </div>
  );
}