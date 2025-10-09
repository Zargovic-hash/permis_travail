import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    telephone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await register({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password,
        telephone: formData.telephone || undefined,
      });
      
      toast({
        title: "Succès",
        description: "Inscription réussie !",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      // AJOUT DEBUG : Afficher l'erreur complète
      console.log('=== ERREUR COMPLETE ===');
      console.log('Message:', error.message);
      console.log('Response data:', error.response?.data);
      console.log('Response status:', error.response?.status);
      console.log('Response errors:', error.response?.data?.errors);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Erreur lors de l\'inscription';
      
      // Afficher les erreurs de validation si elles existent
      const validationErrors = error.response?.data?.errors;
      let detailedMessage = errorMessage;
      
      if (validationErrors && validationErrors.length > 0) {
        detailedMessage = validationErrors.map((e: any) => e.message || e.msg).join('. ');
      }
      
      toast({
        title: "Erreur",
        description: detailedMessage,
        variant: "destructive",
      });
      
      console.error('Registration error details:', error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-xl">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground">HSE Manager</h1>
          <p className="mt-2 text-primary-foreground/80">Créer un nouveau compte</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Inscription</CardTitle>
            <CardDescription>Remplissez le formulaire pour créer votre compte</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input
                    id="prenom"
                    name="prenom"
                    placeholder="Jean"
                    value={formData.prenom}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    name="nom"
                    placeholder="Dupont"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  value={formData.telephone}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Au moins 8 caractères avec une majuscule, une minuscule et un chiffre
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover"
                disabled={isLoading}
              >
                {isLoading ? 'Inscription...' : 'S\'inscrire'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Déjà un compte ?{' '}
                <Link to="/auth/login" className="text-primary hover:underline font-medium">
                  Se connecter
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}