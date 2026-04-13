export const getPropertyTypeLabel = (type: string) => {
  switch (type) {
    case 'apartment': return 'Wohnung';
    case 'house': return 'Haus';
    case 'land': return 'Grundstück';
    case 'commercial': return 'Gewerbe';
    default: return type;
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'draft': return 'Entwurf';
    case 'published': return 'Veröffentlicht';
    case 'archived': return 'Archiviert';
    default: return status;
  }
};

export const getStatusVariant = (status: string) => {
  switch (status) {
    case 'draft': return 'secondary' as const;
    case 'published': return 'default' as const;
    case 'archived': return 'outline' as const;
    default: return 'secondary' as const;
  }
};