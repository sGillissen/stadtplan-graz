import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, FileText, Users, BarChart3, CheckCircle, Clock, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSettings, SETTING_KEYS } from '@/hooks/useSettings';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero-real-estate.jpg';
import domLogo from '@/assets/dom-logo.svg';

const Index = () => {
  const { user } = useAuth();
  const { getSetting } = useSettings();
  const navigate = useNavigate();
  
  const companyName = getSetting(SETTING_KEYS.COMPANY_NAME, 'Dom Immobilien Salzburg');
  const logoUrl = getSetting(SETTING_KEYS.LOGO_URL);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="text-center space-y-6">
            <img 
              src={logoUrl || domLogo} 
              alt={`${companyName} Logo`} 
              className="h-20 mx-auto mb-8"
            />
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
              {companyName}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Die moderne Lösung für Immobilienmakler. Erstellen Sie beeindruckende Exposés 
              mit unserem intuitiven Editor und professionellen Vorlagen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={() => navigate('/dashboard')}
                >
                  Zum Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-white/90"
                    onClick={() => navigate('/auth')}
                  >
                    Jetzt anmelden
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-white/10"
                    onClick={() => navigate('/auth')}
                  >
                    Konto erstellen
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;