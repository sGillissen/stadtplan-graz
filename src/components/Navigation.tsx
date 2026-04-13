import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, X, Building2, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, userRole, signOut } = useAuth();

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Building2 className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-foreground">Exposé</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/create"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === '/create' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Exposé erstellen
                </Link>
                <Link
                  to="/settings"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === '/settings' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Einstellungen
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                    {userRole && (
                      <Badge variant={userRole === 'admin' ? 'default' : 'secondary'}>
                        {userRole === 'admin' ? 'Admin' : 'Manager'}
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Abmelden
                  </Button>
                </div>
              </>
            ) : (
              <Link
                to="/"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Home
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-muted-foreground border-b">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    {userRole && (
                      <Badge variant={userRole === 'admin' ? 'default' : 'secondary'} className="text-xs">
                        {userRole === 'admin' ? 'Admin' : 'Manager'}
                      </Badge>
                    )}
                  </div>
                  <Link
                    to="/dashboard"
                    className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                      location.pathname === '/dashboard' 
                        ? 'text-primary bg-primary/10' 
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/create"
                    className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                      location.pathname === '/create' 
                        ? 'text-primary bg-primary/10' 
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Exposé erstellen
                  </Link>
                  <Link
                    to="/settings"
                    className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                      location.pathname === '/settings' 
                        ? 'text-primary bg-primary/10' 
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Einstellungen
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-base font-medium rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Abmelden
                  </button>
                </>
              ) : (
                <Link
                  to="/"
                  className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                    location.pathname === '/' 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;