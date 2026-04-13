import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, BookOpen } from 'lucide-react';

export interface PropertyDetail {
  label: string;
  value: string;
}

// Predefined templates
const TEMPLATES = {
  apartment: [
    { label: 'Wohnfläche', value: '' },
    { label: 'Zimmer', value: '' },
    { label: 'Etage', value: '' },
    { label: 'Balkon/Terrasse', value: '' },
    { label: 'Baujahr', value: '' },
    { label: 'Heizung', value: '' },
    { label: 'Energieausweis', value: '' },
    { label: 'Betriebskosten', value: '' },
    { label: 'Verfügbar', value: '' }
  ],
  house: [
    { label: 'Wohnfläche', value: '' },
    { label: 'Grundstücksfläche', value: '' },
    { label: 'Zimmer', value: '' },
    { label: 'Etagen', value: '' },
    { label: 'Keller', value: '' },
    { label: 'Garage/Stellplatz', value: '' },
    { label: 'Garten', value: '' },
    { label: 'Baujahr', value: '' },
    { label: 'Heizung', value: '' },
    { label: 'Energieausweis', value: '' }
  ],
  commercial: [
    { label: 'Nutzfläche', value: '' },
    { label: 'Büroräume', value: '' },
    { label: 'Etage', value: '' },
    { label: 'Parkplätze', value: '' },
    { label: 'Baujahr', value: '' },
    { label: 'Ausstattung', value: '' },
    { label: 'Verfügbar', value: '' }
  ]
};

interface PropertyDetailsEditorProps {
  propertyDetails: PropertyDetail[];
  onChange: (details: PropertyDetail[]) => void;
}

const PropertyDetailsEditor: React.FC<PropertyDetailsEditorProps> = ({
  propertyDetails,
  onChange,
}) => {
  const [details, setDetails] = useState<PropertyDetail[]>(
    propertyDetails.length > 0 ? propertyDetails : [{ label: '', value: '' }]
  );

  const handleDetailChange = (index: number, field: 'label' | 'value', value: string) => {
    const newDetails = [...details];
    newDetails[index][field] = value;
    setDetails(newDetails);
    onChange(newDetails.filter(detail => detail.label.trim() || detail.value.trim()));
  };

  const addDetail = () => {
    const newDetails = [...details, { label: '', value: '' }];
    setDetails(newDetails);
  };

  const removeDetail = (index: number) => {
    const newDetails = details.filter((_, i) => i !== index);
    setDetails(newDetails.length > 0 ? newDetails : [{ label: '', value: '' }]);
    onChange(newDetails.filter(detail => detail.label.trim() || detail.value.trim()));
  };

  const loadTemplate = (templateKey: string) => {
    const template = TEMPLATES[templateKey as keyof typeof TEMPLATES];
    if (template) {
      setDetails(template);
      onChange(template);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Objektdetails (Tabelle)</span>
          <div className="flex items-center gap-2">
            <Select onValueChange={loadTemplate}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Vorlage wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">Wohnung</SelectItem>
                <SelectItem value="house">Haus</SelectItem>
                <SelectItem value="commercial">Gewerbe</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <BookOpen className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {details.map((detail, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  value={detail.label}
                  onChange={(e) => handleDetailChange(index, 'label', e.target.value)}
                  placeholder="Bezeichnung"
                  className="h-9"
                />
              </div>
              <div className="flex-1">
                <Input
                  value={detail.value}
                  onChange={(e) => handleDetailChange(index, 'value', e.target.value)}
                  placeholder="Wert"
                  className="h-9"
                />
              </div>
              {details.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeDetail(index)}
                  className="h-9 w-9 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        
        <Button
          variant="outline"
          onClick={addDetail}
          className="w-full"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Detail hinzufügen
        </Button>
        
        <div className="text-sm text-muted-foreground">
          <p className="mb-2"><strong>Tipp:</strong> Verwenden Sie die Vorlagen für häufige Immobilientypen.</p>
          <p className="text-xs">Beispiele: Wohnfläche: 85 m² • Zimmer: 3 • Etage: 2. OG</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyDetailsEditor;