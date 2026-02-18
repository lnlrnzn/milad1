import { Document, Page, Text } from "@react-pdf/renderer"
import { PdfHeader, PdfFooter, PdfSection, PdfBodyText, baseStyles } from "./base-template"

export interface GenericDocumentProps {
  title: string
  sections: { heading?: string; body: string }[]
  metadata?: {
    author?: string
    date?: string
  }
}

export function GenericDocument({
  title,
  sections,
  metadata,
}: GenericDocumentProps) {
  return (
    <Document
      title={title}
      author={metadata?.author ?? "SDIA Portal"}
      creator="SDIA Portal"
    >
      <Page size="A4" style={baseStyles.page}>
        <PdfHeader date={metadata?.date} />
        <Text style={baseStyles.pageTitle}>{title}</Text>
        {sections.map((section) => (
          <PdfSection key={section.heading} heading={section.heading}>
            <PdfBodyText>{section.body}</PdfBodyText>
          </PdfSection>
        ))}
        <PdfFooter />
      </Page>
    </Document>
  )
}
