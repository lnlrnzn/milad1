import "server-only"
import { createElement } from "react"
import { renderToBuffer } from "@react-pdf/renderer"

export type PdfTemplateType =
  | "generic-document"
  | "portfolio-report"
  | "property-detail"

export interface PdfGenerateOptions {
  template: PdfTemplateType
  props: Record<string, unknown>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = React.ComponentType<any>

async function resolveTemplate(
  template: PdfTemplateType
): Promise<AnyComponent> {
  switch (template) {
    case "portfolio-report": {
      const mod = await import("./templates/portfolio-report")
      return mod.PortfolioReport
    }
    case "property-detail": {
      const mod = await import("./templates/property-detail")
      return mod.PropertyDetail
    }
    case "generic-document":
    default: {
      const mod = await import("./templates/generic-document")
      return mod.GenericDocument
    }
  }
}

export async function generatePdfBuffer(
  options: PdfGenerateOptions
): Promise<Buffer> {
  const Template = await resolveTemplate(options.template)
  const element = createElement(Template, options.props)
  const buffer = await renderToBuffer(element)
  return Buffer.from(buffer)
}
