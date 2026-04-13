import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface AppSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  created_at: string;
  updated_at: string;
}

export const SETTING_KEYS = {
  CONTACT_INFO: 'contact_info',
  MISC_INFO: 'misc_info',
  PURCHASE_COSTS: 'purchase_costs',
  PRIVACY_POLICY: 'privacy_policy',
  LOGO_URL: 'logo_url',
  GENERAL_CONTACT: 'general_contact',
  FOOTER_TEXT: 'footer_text',
  COMPANY_NAME: 'company_name',
} as const;

export const useSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('*');

      if (error) {
        console.error('Error fetching settings:', error);
        toast({
          title: "Fehler beim Laden",
          description: "Einstellungen konnten nicht geladen werden.",
          variant: "destructive",
        });
        return;
      }

      // Convert array to key-value object
      const settingsObject = (data || []).reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, string>);

      setSettings(settingsObject);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Fehler beim Laden",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    if (!user) return false;

    try {
      // First, check if setting already exists
      const { data: existingSetting } = await supabase
        .from('app_settings')
        .select('*')
        .eq('setting_key', key)
        .single();

      let error;
      if (existingSetting) {
        // Update existing setting
        const result = await supabase
          .from('app_settings')
          .update({
            setting_value: value,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSetting.id);
        error = result.error;
      } else {
        // Create new setting
        const result = await supabase
          .from('app_settings')
          .insert({
            user_id: user.id,
            setting_key: key,
            setting_value: value,
          });
        error = result.error;
      }

      if (error) {
        console.error('Error updating setting:', error);
        toast({
          title: "Fehler beim Speichern",
          description: "Die Einstellung konnte nicht gespeichert werden.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Einstellung gespeichert",
        description: "Ihre Änderung wurde erfolgreich gespeichert.",
      });

      // Update local state
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));

      return true;
    } catch (error) {
      console.error('Error updating setting:', error);
      return false;
    }
  };

  const getSetting = (key: string, defaultValue: string = '') => {
    return settings[key] || defaultValue;
  };

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  return {
    settings,
    loading,
    updateSetting,
    getSetting,
    refetch: fetchSettings,
  };
};