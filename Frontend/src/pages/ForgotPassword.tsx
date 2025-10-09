import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Si un compte existe avec cet email, un lien de réinitialisation a été envoyé');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-success/10 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Email envoyé</CardTitle>
            <CardDescription>
              Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la connexion
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-success/10 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
          <CardDescription>
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Envoi...' : 'Envoyer le lien'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline font-medium">
                <ArrowLeft className="inline mr-1 h-3 w-3" />
                Retour à la connexion
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}