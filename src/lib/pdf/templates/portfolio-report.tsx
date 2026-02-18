import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { PDF_BRAND } from "./brand"
import { PdfHeader, PdfFooter, PdfSection, baseStyles } from "./base-template"

const styles = StyleSheet.create({
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    width: "48%",
    padding: 10,
    backgroundColor: PDF_BRAND.cream,
    borderRadius: 4,
  },
  kpiLabel: {
    fontSize: 8,
    color: PDF_BRAND.textSecondary,
    marginBottom: 3,
  },
  kpiValue: {
    fontSize: 14,
    fontFamily: PDF_BRAND.fontHeading,
    color: PDF_BRAND.textPrimary,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: PDF_BRAND.green,
    padding: 6,
    borderRadius: 2,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: PDF_BRAND.fontHeading,
    color: "#ffffff",
  },
  tableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: PDF_BRAND.border,
  },
  tableCell: {
    fontSize: 9,
    color: PDF_BRAND.textPrimary,
  },
  col1: { width: "30%" },
  col2: { width: "20%" },
  col3: { width: "20%" },
  col4: { width: "15%" },
  col5: { width: "15%" },
})

export interface PortfolioReportProps {
  title: string
  summary: {
    totalValue: string
    appreciation: string
    monthlyRent: string
    monthlyNet: string
    grossYield: string
    propertyCount: string
  }
  properties: {
    name: string
    address: string
    currentValue: string
    monthlyRent: string
    netIncome: string
  }[]
  metadata?: {
    author?: string
    date?: string
    clientName?: string
  }
}

export function PortfolioReport({
  title,
  summary,
  properties,
  metadata,
}: PortfolioReportProps) {
  return (
    <Document
      title={title}
      author={metadata?.author ?? "SDIA Portal"}
      creator="SDIA Portal"
    >
      <Page size="A4" style={baseStyles.page}>
        <PdfHeader date={metadata?.date} />
        <Text style={baseStyles.pageTitle}>{title}</Text>

        {metadata?.clientName && (
          <Text
            style={{
              fontSize: 11,
              color: PDF_BRAND.textSecondary,
              marginBottom: 16,
            }}
          >
            Erstellt für: {metadata.clientName}
          </Text>
        )}

        {/* KPI Grid */}
        <PdfSection heading="Portfolio-Übersicht">
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Gesamtwert</Text>
              <Text style={styles.kpiValue}>{summary.totalValue}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Wertsteigerung</Text>
              <Text style={styles.kpiValue}>{summary.appreciation}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Mtl. Mieteinnahmen</Text>
              <Text style={styles.kpiValue}>{summary.monthlyRent}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Mtl. Netto-Cashflow</Text>
              <Text style={styles.kpiValue}>{summary.monthlyNet}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Brutto-Rendite</Text>
              <Text style={styles.kpiValue}>{summary.grossYield}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Immobilien</Text>
              <Text style={styles.kpiValue}>{summary.propertyCount}</Text>
            </View>
          </View>
        </PdfSection>

        {/* Properties Table */}
        <PdfSection heading="Immobilien-Details">
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>Objekt</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>Standort</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>Marktwert</Text>
            <Text style={[styles.tableHeaderText, styles.col4]}>Miete/Mo.</Text>
            <Text style={[styles.tableHeaderText, styles.col5]}>Netto/Mo.</Text>
          </View>
          {properties.map((p) => (
            <View key={p.name} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col1]}>{p.name}</Text>
              <Text style={[styles.tableCell, styles.col2]}>{p.address}</Text>
              <Text style={[styles.tableCell, styles.col3]}>{p.currentValue}</Text>
              <Text style={[styles.tableCell, styles.col4]}>{p.monthlyRent}</Text>
              <Text style={[styles.tableCell, styles.col5]}>{p.netIncome}</Text>
            </View>
          ))}
        </PdfSection>

        <PdfFooter />
      </Page>
    </Document>
  )
}
