import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ImageUpload from '@/components/ImageUpload';
import { ImageWithDescription } from '@/types/image';
import { useSettings, SETTING_KEYS } from '@/hooks/useSettings';
import { Loader2, Save, Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  const { settings, loading, updateSetting, getSetting } = useSettings();
  const [saving, setSaving] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    contactInfo: '',
    generalContact: '',
    miscInfo: '',
    purchaseCosts: '',
    privacyPolicy: '',
    logoUrl: '',
    footerText: '',
    companyName: '',
  });

  // Initialize form data when settings load
  React.useEffect(() => {
    if (!loading) {
      setFormData({
        contactInfo: getSetting(SETTING_KEYS.CONTACT_INFO),
        generalContact: getSetting(SETTING_KEYS.GENERAL_CONTACT),
        miscInfo: getSetting(SETTING_KEYS.MISC_INFO),
        purchaseCosts: getSetting(SETTING_KEYS.PURCHASE_COSTS),
        privacyPolicy: getSetting(SETTING_KEYS.PRIVACY_POLICY),
        logoUrl: getSetting(SETTING_KEYS.LOGO_URL),
        footerText: getSetting(SETTING_KEYS.FOOTER_TEXT),
        companyName: getSetting(SETTING_KEYS.COMPANY_NAME),
      });
    }
  }, [loading, settings]);

  const handleSave = async (key: string, value: string) => {
    setSaving(key);
    await updateSetting(key, value);
    setSaving(null);
  };

  const handleInputChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData(prev => ({
        ...prev,
        logoUrl: urls[0]
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Einstellungen</h1>
      </div>

      <div className="grid gap-6">
        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Firmen-Logo</CardTitle>
            <CardDescription>
              Logo für den PDF-Header (wird in allen Exposés verwendet)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 items-center">
              {/* Logo Display - 2/3 */}
              <div className="col-span-2">
                {formData.logoUrl ? (
                  <div className="w-full h-32 border border-border rounded-lg overflow-hidden bg-secondary flex items-center justify-center">
                    <img
                      src={formData.logoUrl}
                      alt="Firmen-Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 border border-border rounded-lg bg-secondary flex items-center justify-center">
                    <span className="text-muted-foreground">Kein Logo hochgeladen</span>
                  </div>
                )}
              </div>
              
              {/* Upload Area - 1/3 */}
              <div className="col-span-1 flex flex-col items-center gap-3">
                <ImageUpload
                  images={[]}
                  onImagesChange={(imageData: ImageWithDescription[]) => {
                    const url = imageData[0]?.url || '';
                    setFormData(prev => ({ ...prev, logoUrl: url }));
                  }}
                  maxImages={1}
                />
                <Button
                  onClick={() => handleSave(SETTING_KEYS.LOGO_URL, formData.logoUrl)}
                  disabled={saving === SETTING_KEYS.LOGO_URL}
                  size="sm"
                >
                  {saving === SETTING_KEYS.LOGO_URL ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Speichern
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Name */}
        <Card>
          <CardHeader>
            <CardTitle>Firmenname</CardTitle>
            <CardDescription>
              Der Name Ihres Unternehmens (wird auf der Titelseite angezeigt)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName')(e.target.value)}
              placeholder="z.B. Dom Immobilien Salzburg"
            />
            <Button
              onClick={() => handleSave(SETTING_KEYS.COMPANY_NAME, formData.companyName)}
              disabled={saving === SETTING_KEYS.COMPANY_NAME}
            >
              {saving === SETTING_KEYS.COMPANY_NAME ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Speichern
            </Button>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Kontaktinformationen</CardTitle>
            <CardDescription>
              Diese Informationen werden in jedem Exposé angezeigt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={formData.contactInfo}
              onChange={(e) => handleInputChange('contactInfo')(e.target.value)}
              placeholder="Ihre persönlichen Kontaktdaten (Name, Telefon, E-Mail, etc.)"
              rows={4}
            />
            <Button
              onClick={() => handleSave(SETTING_KEYS.CONTACT_INFO, formData.contactInfo)}
              disabled={saving === SETTING_KEYS.CONTACT_INFO}
            >
              {saving === SETTING_KEYS.CONTACT_INFO ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Speichern
            </Button>
          </CardContent>
        </Card>

        {/* General Company Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Allgemeine Firmendaten</CardTitle>
            <CardDescription>
              Allgemeine Kontaktdaten der Firma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={formData.generalContact}
              onChange={(e) => handleInputChange('generalContact')(e.target.value)}
              placeholder="Firmenname, Adresse, Telefon, E-Mail, etc."
              rows={4}
            />
            <Button
              onClick={() => handleSave(SETTING_KEYS.GENERAL_CONTACT, formData.generalContact)}
              disabled={saving === SETTING_KEYS.GENERAL_CONTACT}
            >
              {saving === SETTING_KEYS.GENERAL_CONTACT ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Speichern
            </Button>
          </CardContent>
        </Card>

        {/* Purchase Costs */}
        <Card>
          <CardHeader>
            <CardTitle>Kaufnebenkosten</CardTitle>
            <CardDescription>
              Standardtext zu Kaufnebenkosten für alle Exposés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={formData.purchaseCosts}
              onChange={(e) => handleInputChange('purchaseCosts')(e.target.value)}
              placeholder="Informationen zu Kaufnebenkosten, Provision, etc."
              rows={4}
            />
            <Button
              onClick={() => handleSave(SETTING_KEYS.PURCHASE_COSTS, formData.purchaseCosts)}
              disabled={saving === SETTING_KEYS.PURCHASE_COSTS}
            >
              {saving === SETTING_KEYS.PURCHASE_COSTS ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Speichern
            </Button>
          </CardContent>
        </Card>

        {/* Miscellaneous */}
        <Card>
          <CardHeader>
            <CardTitle>Sonstiges</CardTitle>
            <CardDescription>
              Zusätzliche Informationen für alle Exposés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={formData.miscInfo}
              onChange={(e) => handleInputChange('miscInfo')(e.target.value)}
              placeholder="Weitere wichtige Informationen, Hinweise, etc."
              rows={4}
            />
            <Button
              onClick={() => handleSave(SETTING_KEYS.MISC_INFO, formData.miscInfo)}
              disabled={saving === SETTING_KEYS.MISC_INFO}
            >
              {saving === SETTING_KEYS.MISC_INFO ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Speichern
            </Button>
          </CardContent>
        </Card>

        {/* Privacy Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Datenschutz</CardTitle>
            <CardDescription>
              Datenschutzerklärung und rechtliche Hinweise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={formData.privacyPolicy}
              onChange={(e) => handleInputChange('privacyPolicy')(e.target.value)}
              placeholder="Datenschutzerklärung und rechtliche Hinweise"
              rows={4}
            />
            <Button
              onClick={() => handleSave(SETTING_KEYS.PRIVACY_POLICY, formData.privacyPolicy)}
              disabled={saving === SETTING_KEYS.PRIVACY_POLICY}
            >
              {saving === SETTING_KEYS.PRIVACY_POLICY ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Speichern
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card>
          <CardHeader>
            <CardTitle>Fußzeile</CardTitle>
            <CardDescription>
              Text für die Fußzeile in allen Exposés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={formData.footerText}
              onChange={(e) => handleInputChange('footerText')(e.target.value)}
              placeholder="Text für die Fußzeile (z.B. Impressum, weitere Kontaktdaten)"
              rows={3}
            />
            <Button
              onClick={() => handleSave(SETTING_KEYS.FOOTER_TEXT, formData.footerText)}
              disabled={saving === SETTING_KEYS.FOOTER_TEXT}
            >
              {saving === SETTING_KEYS.FOOTER_TEXT ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Speichern
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;