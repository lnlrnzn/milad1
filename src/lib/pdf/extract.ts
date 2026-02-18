import "server-only"

export interface PdfExtractResult {
  text: string
  pageCount: number
  truncated: boolean
}

const MAX_CHARS = 40_000

export async function extractPdfText(
  buffer: ArrayBuffer
): Promise<PdfExtractResult> {
  const { extractText } = await import("unpdf")
  const { text, totalPages } = await extractText(new Uint8Array(buffer), {
    mergePages: true,
  })

  const truncated = text.length > MAX_CHARS

  return {
    text: truncated
      ? text.slice(0, MAX_CHARS) +
        "\n\n[Text wurde bei 40.000 Zeichen abgeschnitten]"
      : text,
    pageCount: totalPages,
    truncated,
  }
}
