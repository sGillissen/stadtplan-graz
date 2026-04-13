import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx';
import { getPropertyTypeLabel } from '@/lib/expose-utils';

interface SimpleWordTemplateProps {
  expose: any;
  settings: any;
}

export const generateSimpleWordDocument = async (expose: any, settings: any): Promise<Blob> => {
  // Helper function to format price
  const formatPrice = (price: number | string) => {
    if (!price) return "Preis auf Anfrage";
    return `${Number(price).toLocaleString()} €`;
  };

  // Document content
  const documentChildren = [
    // Title
    new Paragraph({
      children: [
        new TextRun({
          text: expose.title,
          bold: true,
          size: 36,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),

    // Property type
    new Paragraph({
      children: [
        new TextRun({
          text: getPropertyTypeLabel(expose.property_type),
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),

    // Price
    new Paragraph({
      children: [
        new TextRun({
          text: "Kaufpreis: ",
          bold: true,
          size: 28,
        }),
        new TextRun({
          text: formatPrice(expose.price),
          size: 28,
          color: "2563eb",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),

    // Address
    ...(expose.address ? [
      new Paragraph({
        children: [
          new TextRun({
            text: "Adresse: ",
            bold: true,
          }),
          new TextRun({
            text: expose.address,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    ] : []),

    // Basic details
    ...(expose.rooms || expose.area ? [
      new Paragraph({
        children: [
          new TextRun({
            text: "Details",
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      ...(expose.rooms ? [
        new Paragraph({
          children: [
            new TextRun({
              text: `Zimmer: ${expose.rooms}`,
            }),
          ],
          spacing: { after: 100 },
        })
      ] : []),
      ...(expose.area ? [
        new Paragraph({
          children: [
            new TextRun({
              text: `Wohnfläche: ${expose.area} m²`,
            }),
          ],
          spacing: { after: 100 },
        })
      ] : []),
    ] : []),

    // Short info
    ...(expose.short_info ? [
      new Paragraph({
        children: [
          new TextRun({
            text: "Kurzinfo",
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: expose.short_info,
          }),
        ],
        spacing: { after: 200 },
      })
    ] : []),

    // Description
    ...(expose.description ? [
      new Paragraph({
        children: [
          new TextRun({
            text: "Objektbeschreibung",
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: expose.description,
          }),
        ],
        spacing: { after: 200 },
      })
    ] : []),

    // Location & infrastructure
    ...(expose.location_infrastructure ? [
      new Paragraph({
        children: [
          new TextRun({
            text: "Adresse & Infrastruktur",
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: expose.location_infrastructure,
          }),
        ],
        spacing: { after: 200 },
      })
    ] : []),

    // Equipment
    ...(expose.equipment_text ? [
      new Paragraph({
        children: [
          new TextRun({
            text: "Ausstattung",
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: expose.equipment_text,
          }),
        ],
        spacing: { after: 200 },
      })
    ] : []),

    // Property details
    ...(expose.property_details && expose.property_details.length > 0 ? [
      new Paragraph({
        children: [
          new TextRun({
            text: "Objektdetails",
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      ...expose.property_details.map((detail: any) =>
        new Paragraph({
          children: [
            new TextRun({
              text: `${detail.label}: `,
              bold: true,
            }),
            new TextRun({
              text: detail.value,
            }),
          ],
          spacing: { after: 100 },
        })
      )
    ] : []),

    // Contact info
    ...(settings?.company_name || settings?.contact_info ? [
      new Paragraph({
        children: [
          new TextRun({
            text: "Kontakt",
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      ...(settings.company_name ? [
        new Paragraph({
          children: [
            new TextRun({
              text: settings.company_name,
              bold: true,
            }),
          ],
          spacing: { after: 100 },
        })
      ] : []),
      ...(settings.contact_info ? [
        new Paragraph({
          children: [
            new TextRun({
              text: settings.contact_info,
            }),
          ],
          spacing: { after: 200 },
        })
      ] : []),
    ] : []),
  ];

  // Create the document
  const doc = new Document({
    sections: [
      {
        children: documentChildren,
      },
    ],
  });

  // Generate and return the blob using browser-compatible method
  const buffer = await Packer.toBlob(doc);
  return buffer;
};