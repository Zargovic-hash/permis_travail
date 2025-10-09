# Frontend HSE - Système de Permis de Travail

## 🎯 Vue d'ensemble

Frontend React moderne pour le système de gestion des permis de travail HSE. Interface utilisateur intuitive et responsive conçue pour les professionnels de la sécurité au travail.

## 🚀 Technologies utilisées

- **React 18** - Framework principal
- **TypeScript** - Typage statique
- **Vite** - Build tool moderne
- **Tailwind CSS** - Framework CSS utilitaire
- **Shadcn/ui** - Composants UI modernes
- **React Query** - Gestion d'état serveur
- **React Router DOM** - Routage
- **Axios** - Client HTTP
- **Date-fns** - Manipulation des dates
- **Lucide React** - Icônes
- **Sonner** - Notifications toast

## 📁 Structure du projet

```
src/
├── components/           # Composants réutilisables
│   ├── common/          # Composants communs
│   ├── layout/          # Composants de mise en page
│   ├── permis/          # Composants spécifiques aux permis
│   ├── reports/         # Composants de rapports
│   └── ui/              # Composants UI de base
├── contexts/            # Contextes React
├── hooks/               # Hooks personnalisés
├── lib/                 # Utilitaires et configuration
├── pages/               # Pages de l'application
├── services/            # Services API
├── types/               # Définitions TypeScript
└── utils/               # Fonctions utilitaires
```

## 🛠️ Installation

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Backend HSE fonctionnel

### Installation des dépendances

```bash
cd Frontend
npm install
```

### Configuration

1. Copiez le fichier de configuration :
```bash
cp env.example .env.local
```

2. Ajustez les variables d'environnement dans `.env.local` :
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Système HSE - Permis de Travail
```

### Démarrage en développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🎨 Fonctionnalités principales

### 🔐 Authentification et autorisation
- Connexion/déconnexion sécurisée
- Gestion des rôles (Demandeur, Superviseur, Responsable Zone, HSE, Admin)
- Protection des routes par rôle
- Refresh token automatique

### 📋 Gestion des permis
- Création de permis avec workflow de validation
- Filtres avancés (zone, type, statut, dates)
- Actions contextuelles selon le rôle
- Export PDF avec signatures
- Timeline des approbations

### 👥 Gestion des utilisateurs
- Interface d'administration (HSE/Admin uniquement)
- Soft delete et anonymisation
- Gestion des rôles et habilitations
- Profils utilisateur complets

### 📊 Rapports et statistiques
- Dashboard avec KPIs
- Graphiques interactifs
- Export CSV/PDF
- Filtres par période

### 🔍 Audit et traçabilité
- Logs d'audit complets
- Historique des actions
- Export des logs
- Recherche et filtres

## 🎯 Rôles et permissions

### Demandeur
- Créer et modifier ses permis (brouillon/en attente)
- Consulter ses permis
- Exporter PDF de ses permis

### Superviseur
- Valider les permis en attente
- Clôturer les permis
- Consulter tous les permis
- Accès aux rapports

### Responsable de Zone
- Valider les permis validés par superviseur
- Suspendre les permis actifs
- Consulter les permis de sa zone
- Accès aux rapports

### HSE (Superutilisateur)
- Accès complet à toutes les fonctionnalités
- Gestion des utilisateurs
- Administration système
- Accès aux logs d'audit

### Administrateur IT
- Gestion des utilisateurs
- Configuration système
- Accès aux logs d'audit

## 🔧 Configuration avancée

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|---------|
| `VITE_API_URL` | URL de l'API backend | `http://localhost:3000/api` |
| `VITE_APP_NAME` | Nom de l'application | `Système HSE - Permis de Travail` |
| `VITE_MAX_FILE_SIZE` | Taille max des fichiers (bytes) | `10485760` (10MB) |
| `VITE_TOAST_DURATION` | Durée des notifications (ms) | `5000` |

### Personnalisation des thèmes

Le système utilise Tailwind CSS avec des variables CSS personnalisées. Vous pouvez modifier les couleurs dans `src/index.css` :

```css
:root {
  --primary: 210 40% 50%;
  --secondary: 210 40% 96%;
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --error: 0 84% 60%;
}
```

## 📱 Responsive Design

L'interface s'adapte automatiquement aux différentes tailles d'écran :
- **Mobile** (< 768px) : Navigation hamburger, cartes empilées
- **Tablet** (768px - 1024px) : Sidebar réduite, grille 2 colonnes
- **Desktop** (> 1024px) : Sidebar complète, grille 3+ colonnes

## 🔒 Sécurité

### Mesures implémentées
- Validation côté client et serveur
- Sanitisation des entrées utilisateur
- Protection CSRF via tokens
- Gestion sécurisée des fichiers
- Logs d'audit complets

### Bonnes pratiques
- Pas de stockage de données sensibles côté client
- Chiffrement des communications HTTPS
- Gestion des erreurs sans exposition d'informations
- Timeout des sessions

## 🧪 Tests

### Tests unitaires
```bash
npm run test
```

### Tests E2E
```bash
npm run test:e2e
```

### Coverage
```bash
npm run test:coverage
```

## 📦 Build et déploiement

### Build de production
```bash
npm run build
```

### Preview du build
```bash
npm run preview
```

### Déploiement

#### Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Netlify
```bash
npm run build
# Upload du dossier dist/
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🐛 Débogage

### Outils de développement
- React DevTools
- Redux DevTools (si utilisé)
- Network tab pour les appels API
- Console pour les logs

### Logs
```javascript
// Activer les logs détaillés
localStorage.setItem('debug', 'true');
```

### Erreurs courantes

#### Erreur de connexion API
- Vérifier `VITE_API_URL` dans `.env.local`
- S'assurer que le backend est démarré
- Vérifier les CORS

#### Erreurs de permissions
- Vérifier le rôle utilisateur
- Contrôler les tokens d'authentification
- Vérifier les permissions backend

## 🤝 Contribution

### Workflow
1. Fork du projet
2. Créer une branche feature
3. Commiter les changements
4. Pousser vers la branche
5. Créer une Pull Request

### Standards de code
- ESLint + Prettier configurés
- TypeScript strict mode
- Tests unitaires requis
- Documentation des composants

## 📚 Documentation API

La documentation complète de l'API est disponible via Swagger :
- URL : `http://localhost:3000/api-docs`
- Format : OpenAPI 3.0

## 🆘 Support

### Problèmes connus
- Voir les [Issues GitHub](../../issues)
- Consulter la [FAQ](../../wiki/FAQ)

### Contact
- Email : support@hse-permis.com
- Documentation : [Wiki](../../wiki)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](../../LICENSE) pour plus de détails.

## 🔄 Changelog

### v1.0.0 (2024-01-XX)
- Version initiale
- Gestion complète des permis
- Interface responsive
- Authentification sécurisée
- Rapports et statistiques

---

**Développé avec ❤️ pour la sécurité au travail**