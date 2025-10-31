import React, { useState } from 'react';
import axios from 'axios';
import { Search, CheckCircle, XCircle, AlertCircle, Shield, Calendar, User, FileText } from 'lucide-react';

export default function VerifyPermis() {
  const [numeroPermis, setNumeroPermis] = useState('');
  const [codeSecurite, setCodeSecurite] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // ✅ Vérification par code de sécurité UNIQUEMENT
      const response = await axios.post('/api/verify/security-code', {
        securityCode: codeSecurite.trim().replace(/\s+/g, ''), // Enlever TOUS les espaces
        numeroPermis: numeroPermis.trim()
      });

      setResult(response.data);
    } catch (err) {
      console.error('Erreur vérification:', err);
      setError(
        err.response?.data?.message || 
        'Erreur lors de la vérification. Vérifiez les informations saisies.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour formater le code avec espaces visuels
  const formatSecurityCode = (value) => {
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const limited = cleaned.substring(0, 12);
    const formatted = limited.match(/.{1,4}/g)?.join(' ') || limited;
    return formatted;
  };

  const handleCodeSecuriteChange = (e) => {
    const formatted = formatSecurityCode(e.target.value);
    setCodeSecurite(formatted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
              <Shield className="text-blue-600" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Vérifier un Permis de Travail
            </h1>
            <p className="text-gray-600">
              Vérifiez l'authenticité et la validité d'un permis de travail avec son code de sécurité
            </p>
          </div>

          {/* Info méthode */}
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    Vérification par Code de Sécurité
                  </h3>
                  <p className="text-sm text-blue-700">
                    Entrez le numéro de permis et le code de sécurité à 12 caractères qui se trouve sur le document PDF
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro du permis *
              </label>
              <input
                type="text"
                placeholder="Ex: PT-2025-00034"
                value={numeroPermis}
                onChange={(e) => setNumeroPermis(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code de sécurité *
                <span className="text-xs text-gray-500 ml-2">
                  (12 caractères - les espaces sont automatiques)
                </span>
              </label>
              <input
                type="text"
                placeholder="A1B2 C3D4 E5F6"
                value={codeSecurite}
                onChange={handleCodeSecuriteChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-lg tracking-wider transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Astuce: Vous pouvez copier-coller le code directement depuis le PDF
              </p>
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || !numeroPermis || codeSecurite.replace(/\s/g, '').length !== 12}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              <Search size={20} />
              {loading ? 'Vérification en cours...' : 'Vérifier le permis'}
            </button>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex gap-3 animate-fadeIn">
              <XCircle className="text-red-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Erreur de vérification</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Résultat */}
          {result && (
            <div className="space-y-6 animate-fadeIn">
              {/* Badge principal */}
              <div className={`p-6 rounded-lg text-center shadow-lg ${
                result.isValid === true
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500' 
                  : result.isValid === false
                  ? 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-500'
                  : 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-500'
              }`}>
                {result.isValid === true ? (
                  <>
                    <CheckCircle className="mx-auto text-green-600 mb-3" size={56} />
                    <h2 className="text-3xl font-bold text-green-700 mb-2">
                      ✅ PERMIS VALIDE
                    </h2>
                    <p className="text-green-600">{result.message || 'Permis authentique et valide'}</p>
                  </>
                ) : result.isValid === false ? (
                  <>
                    <XCircle className="mx-auto text-red-600 mb-3" size={56} />
                    <h2 className="text-3xl font-bold text-red-700 mb-2">
                      ❌ PERMIS INVALIDE
                    </h2>
                    <p className="text-red-600">{result.message || 'Permis non valide'}</p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="mx-auto text-yellow-600 mb-3" size={56} />
                    <h2 className="text-3xl font-bold text-yellow-700 mb-2">
                      ⚠️ VÉRIFICATION PARTIELLE
                    </h2>
                    <p className="text-yellow-600">{result.message || 'Statut indéterminé'}</p>
                  </>
                )}
              </div>

              {/* Informations du permis */}
              {result.permis && (
                <div className="bg-gray-50 rounded-lg p-6 shadow-md">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-blue-600" />
                    Informations du Permis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Numéro</p>
                      <p className="font-mono font-bold text-blue-600">{result.permis.numero}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Statut</p>
                      <p className="font-bold text-gray-800">
                        <span className={`inline-block px-2 py-1 rounded text-sm ${
                          result.permis.statut === 'EN_COURS' || result.permis.statut === 'VALIDE' || result.permis.statut === 'APPROUVE' 
                            ? 'bg-green-100 text-green-800' :
                          result.permis.statut === 'BROUILLON' 
                            ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {result.permis.statut}
                        </span>
                      </p>
                    </div>
                    <div className="md:col-span-2 bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Titre du travail</p>
                      <p className="font-bold text-gray-800">{result.permis.titre}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Zone</p>
                      <p className="font-bold text-gray-800">{result.permis.zone}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Calendar size={14} />
                        Valide jusqu'au
                      </p>
                      <p className="font-bold text-gray-800">
                        {new Date(result.permis.dateFin).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    {result.permis.demandeur && (
                      <div className="md:col-span-2 bg-white p-3 rounded border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                          <User size={14} />
                          Demandeur
                        </p>
                        <p className="font-bold text-gray-800">{result.permis.demandeur}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info supplémentaire */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            💡 Pour toute question sur la vérification, contactez le service HSE
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}