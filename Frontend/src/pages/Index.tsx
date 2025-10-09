import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, FileText, Users, BarChart3, CheckCircle } from 'lucide-react';

export default function Index() {
  const features = [
    {
      icon: FileText,
      title: 'Gestion des Permis',
      description: 'Créez, suivez et gérez tous vos permis de travail en un seul endroit',
    },
    {
      icon: Users,
      title: 'Workflow Collaboratif',
      description: 'Système d\'approbation multi-niveaux avec rôles et permissions',
    },
    {
      icon: BarChart3,
      title: 'Tableaux de Bord',
      description: 'Visualisez vos KPIs et suivez l\'activité en temps réel',
    },
    {
      icon: CheckCircle,
      title: 'Conformité HSE',
      description: 'Assurez la conformité avec les normes de sécurité et environnement',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold text-primary-foreground">HSE Manager</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth/login">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
                Connexion
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button className="bg-accent hover:bg-accent-hover">
                Commencer
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Content */}
        <section className="container mx-auto px-4 py-20 text-center animate-fade-in">
          <h1 className="text-5xl font-bold text-primary-foreground mb-6">
            Gestion des Permis de Travail HSE
          </h1>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Solution professionnelle pour gérer, approuver et suivre vos permis de travail
            en toute conformité avec les normes HSE
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <Button size="lg" className="bg-accent hover:bg-accent-hover shadow-xl">
                Créer un compte
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button size="lg" variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20">
                Se connecter
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="bg-card rounded-2xl p-12 shadow-2xl">
            <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Rejoignez les entreprises qui font confiance à HSE Manager pour gérer
              leurs permis de travail en toute sécurité
            </p>
            <Link to="/auth/register">
              <Button size="lg" className="bg-accent hover:bg-accent-hover shadow-xl">
                Démarrer maintenant
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-primary-foreground/70">
        <p>&copy; 2024 HSE Manager. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
