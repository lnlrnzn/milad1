import type { ReactNode } from "react"
import { View, Text, StyleSheet } from "@react-pdf/renderer"
import { PDF_BRAND } from "./brand"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 60,
    fontFamily: PDF_BRAND.fontBody,
    fontSize: 10,
  },
  pageTitle: {
    fontSize: 20,
    fontFamily: PDF_BRAND.fontHeading,
    color: PDF_BRAND.textPrimary,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: PDF_BRAND.gold,
  },
  headerTitle: {
    fontSize: 10,
    fontFamily: PDF_BRAND.fontHeading,
    color: PDF_BRAND.gold,
    letterSpacing: 2,
  },
  headerDate: {
    fontSize: 9,
    color: PDF_BRAND.textSecondary,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: PDF_BRAND.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: PDF_BRAND.textSecondary,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 13,
    fontFamily: PDF_BRAND.fontHeading,
    color: PDF_BRAND.green,
    marginBottom: 8,
  },
  body: {
    fontSize: 10,
    fontFamily: PDF_BRAND.fontBody,
    lineHeight: 1.6,
    color: PDF_BRAND.textPrimary,
  },
})

export function PdfHeader({ date }: { date?: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>SDIA KUNDENPORTAL</Text>
      <Text style={styles.headerDate}>
        {date ?? new Date().toLocaleDateString("de-DE")}
      </Text>
    </View>
  )
}

export function PdfFooter({ pageLabel }: { pageLabel?: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        Süddeutsche Immobilienagentur · Mannheim
      </Text>
      <Text style={styles.footerText}>
        {pageLabel ?? "Vertraulich"}
      </Text>
    </View>
  )
}

export function PdfSection({
  heading,
  children,
}: {
  heading?: string
  children: ReactNode
}) {
  return (
    <View style={styles.section}>
      {heading && <Text style={styles.sectionHeading}>{heading}</Text>}
      {children}
    </View>
  )
}

export function PdfBodyText({ children }: { children: string }) {
  return <Text style={styles.body}>{children}</Text>
}

export { styles as baseStyles }
