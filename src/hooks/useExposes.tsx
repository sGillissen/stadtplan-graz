import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { ImageWithDescription, migrateImages } from '@/types/image';
import { PlanWithDescription } from '@/components/PlansUpload';

// Using Database types from Supabase
type Database = any; // We'll use the actual database types

export interface PropertyDetail {
  label: string;
  value: string;
}

export interface CreateExposeData {
  title: string;
  short_info?: string;
  hero_image?: string;
  description?: string;
  location_infrastructure?: string;
  equipment_text?: string;
  property_type: 'house' | 'apartment' | 'commercial' | 'land';
  property_details?: any; // JSON-compatible for Supabase
  price?: number;
  area?: number;
  rooms?: number;
  location?: string;
  address?: string;
  features?: string[];
  status?: 'draft' | 'published' | 'archived';
  images?: ImageWithDescription[];
  plans_data?: PlanWithDescription[];
  contact_info?: any;
}

export const useExposes = () => {
  const [exposes, setExposes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchExposes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exposes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching exposés:', error);
        toast({
          title: "Fehler beim Laden",
          description: "Exposés konnten nicht geladen werden.",
          variant: "destructive",
        });
        return;
      }

      setExposes(data || []);
    } catch (error) {
      console.error('Error fetching exposés:', error);
      toast({
        title: "Fehler beim Laden",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createExpose = async (exposeData: CreateExposeData) => {
    if (!user) {
      toast({
        title: "Authentifizierung erforderlich",
        description: "Sie müssen angemeldet sein, um ein Exposé zu erstellen.",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Convert ImageWithDescription[] and PlanWithDescription[] to database format for storage
      const dataForDb: any = {
        ...exposeData,
        images: exposeData.images?.map(img => img.url) || [],
        images_data: exposeData.images?.map(img => ({ url: img.url, description: img.description || '' })) || [],
        plans_data: exposeData.plans_data?.map(plan => ({ url: plan.url, description: plan.description || '', type: 'image', filename: plan.filename })) || [],
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('exposes')
        .insert([dataForDb])
        .select()
        .single();

      if (error) {
        console.error('Error creating exposé:', error);
        toast({
          title: "Fehler beim Speichern",
          description: "Das Exposé konnte nicht gespeichert werden.",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Exposé erstellt",
        description: "Ihr Exposé wurde erfolgreich gespeichert.",
      });

      // Refresh the list
      await fetchExposes();
      
      return data;
    } catch (error) {
      console.error('Error creating exposé:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateExpose = async (id: string, exposeData: Partial<CreateExposeData>) => {
    if (!user) return null;

    try {
      // Convert ImageWithDescription[] and PlanWithDescription[] to database format for storage
      const dataForDb: any = {
        ...exposeData,
        images: exposeData.images?.map(img => img.url) || [],
        images_data: exposeData.images?.map(img => ({ url: img.url, description: img.description || '' })) || [],
        plans_data: exposeData.plans_data?.map(plan => ({ url: plan.url, description: plan.description || '', type: 'image', filename: plan.filename })) || [],
      };

      console.log('updateExpose - Original exposeData:', exposeData);
      console.log('updateExpose - Data for DB:', dataForDb);
      console.log('updateExpose - Images URLs:', dataForDb.images);

      const { data, error } = await supabase
        .from('exposes')
        .update(dataForDb)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating exposé:', error);
        toast({
          title: "Fehler beim Aktualisieren",
          description: "Das Exposé konnte nicht aktualisiert werden.",
          variant: "destructive",
        });
        return null;
      }

      console.log('updateExpose - Successfully updated:', data);

      toast({
        title: "Exposé aktualisiert",
        description: "Ihre Änderungen wurden gespeichert.",
      });

      // Refresh the list
      await fetchExposes();
      
      return data;
    } catch (error) {
      console.error('Error updating exposé:', error);
      return null;
    }
  };

  const deleteExpose = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('exposes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting exposé:', error);
        toast({
          title: "Fehler beim Löschen",
          description: "Das Exposé konnte nicht gelöscht werden.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Exposé gelöscht",
        description: "Das Exposé wurde erfolgreich gelöscht.",
      });

      // Refresh the list
      await fetchExposes();
      
      return true;
    } catch (error) {
      console.error('Error deleting exposé:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchExposes();
    }
  }, [user]);

  return {
    exposes,
    loading,
    createExpose,
    updateExpose,
    deleteExpose,
    refetch: fetchExposes,
  };
};