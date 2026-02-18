import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { PDF_BRAND } from "./brand"
import { PdfHeader, PdfFooter, PdfSection, PdfBodyText, baseStyles } from "./base-template"

const styles = StyleSheet.create({
  title: {
    ...baseStyles.pageTitle,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: PDF_BRAND.textSecondary,
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    width: "31%",
    padding: 8,
    backgroundColor: PDF_BRAND.cream,
    borderRadius: 4,
  },
  metricLabel: {
    fontSize: 8,
    color: PDF_BRAND.textSecondary,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    fontFamily: PDF_BRAND.fontHeading,
    color: PDF_BRAND.textPrimary,
  },
})

export interface PropertyDetailProps {
  title: string
  address: string
  metrics: { label: string; value: string }[]
  sections: { heading?: string; body: string }[]
  metadata?: {
    author?: string
    date?: string
  }
}

export function PropertyDetail({
  title,
  address,
  metrics,
  sections,
  metadata,
}: PropertyDetailProps) {
  return (
    <Document
      title={title}
      author={metadata?.author ?? "SDIA Portal"}
      creator="SDIA Portal"
    >
      <Page size="A4" style={baseStyles.page}>
        <PdfHeader date={metadata?.date} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{address}</Text>

        {/* Key Metrics */}
        <PdfSection heading="Kennzahlen">
          <View style={styles.metricsGrid}>
            {metrics.map((m) => (
              <View key={m.label} style={styles.metricCard}>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <Text style={styles.metricValue}>{m.value}</Text>
              </View>
            ))}
          </View>
        </PdfSection>

        {/* Additional sections */}
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
