import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { Plus, FileText, Eye, Edit, Trash2, BarChart3, Building2, Users } from "lucide-react";
import { useExposes } from "@/hooks/useExposes";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { exposes, loading, deleteExpose } = useExposes();
  const { userRole } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Möchten Sie das Exposé "${title}" wirklich löschen?`)) {
      await deleteExpose(id);
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case 'apartment': return 'Wohnung';
      case 'house': return 'Haus';
      case 'land': return 'Grundstück';
      case 'commercial': return 'Gewerbe';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Entwurf';
      case 'published': return 'Veröffentlicht';
      case 'archived': return 'Archiviert';
      default: return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary' as const;
      case 'published': return 'default' as const;
      case 'archived': return 'outline' as const;
      default: return 'secondary' as const;
    }
  };

  // Calculate statistics
  const stats = {
    total: exposes.length,
    published: exposes.filter(e => e.status === 'published').length,
    drafts: exposes.filter(e => e.status === 'draft').length,
    archived: exposes.filter(e => e.status === 'archived').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Verwalten Sie Ihre Immobilien-Exposés
              {userRole && (
                <Badge variant={userRole === 'admin' ? 'default' : 'secondary'} className="ml-2">
                  {userRole === 'admin' ? 'Admin' : 'Manager'}
                </Badge>
              )}
            </p>
          </div>
          <Link to="/create">
            <Button className="bg-primary hover:bg-primary-hover">
              <Plus className="w-4 h-4 mr-2" />
              Neues Exposé
            </Button>
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Gesamt</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.published}</p>
                <p className="text-sm text-muted-foreground">Veröffentlicht</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <Edit className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.drafts}</p>
                <p className="text-sm text-muted-foreground">Entwürfe</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                <Building2 className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.archived}</p>
                <p className="text-sm text-muted-foreground">Archiviert</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exposés List */}
        <Card>
          <CardHeader>
            <CardTitle>Ihre Exposés</CardTitle>
            <CardDescription>
              {exposes.length === 0 
                ? "Sie haben noch keine Exposés erstellt."
                : `${exposes.length} Exposé${exposes.length !== 1 ? 's' : ''} gefunden`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {exposes.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Keine Exposés vorhanden</h3>
                <p className="text-muted-foreground mb-6">
                  Erstellen Sie Ihr erstes Exposé, um loszulegen.
                </p>
                <Link to="/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Erstes Exposé erstellen
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exposes.map((expose) => (
                  <Card key={expose.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Badge variant={getStatusVariant(expose.status)}>
                          {getStatusLabel(expose.status)}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/view/${expose.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/edit/${expose.id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(expose.id, expose.title)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="w-full h-32 bg-secondary rounded-lg mb-4 overflow-hidden">
                        {expose.images && expose.images.length > 0 ? (
                      <img 
                        src={expose.images[0]} 
                        alt={expose.title}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) {
                            target.style.display = 'none';
                            fallback.style.display = 'flex';
                          }
                        }}
                      />
                        ) : null}
                        <div 
                          className={`w-full h-full flex items-center justify-center ${
                            expose.images && expose.images.length > 0 ? 'hidden' : 'flex'
                          }`}
                        >
                          <span className="text-muted-foreground text-sm">Kein Bild</span>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                          {expose.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {getPropertyTypeLabel(expose.property_type)}
                        </p>
                        {expose.address && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                            {expose.address}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">
                            {expose.price 
                              ? `${Number(expose.price).toLocaleString()} €`
                              : "Preis auf Anfrage"
                            }
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {expose.rooms || "0"} Zi. • {expose.area || "0"} m²
                          </span>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-2">
                          Erstellt: {new Date(expose.created_at).toLocaleDateString('de-DE')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;