import { jsPDF } from "jspdf"

export interface DeskResultBAData {
  program_plan_name: string
  regency_name: string
  province_name: string
  entity_name: string
  desk_date: string | null
  status_desk: number | null
  signature_link: string | null
  signer_name: string | null
  signer_position: string | null
  signature_kemenkes?: {
    signature_url: string
    signer_name: string
    signer_position: string
    program: string | null
  } | null
  signature_kako?: {
    signature_url: string
    signer_name: string
    signer_position: string
    program: string | null
  } | null
  ba_file_url: string | null
  desk_by_name: string | null
  approved_by_name: string | null
  materials: Array<{
    no: number
    name: string
    unit: string
    total_needs: number
    remaining_stock: number
    procurement_proposal: number
    desk_result: number
  }>
  total_items: number
  total_procurement_proposal: number
  total_desk_result: number
}

export class DeskResultBAPDF {
  private doc: jsPDF
  private yPos: number = 20
  private pageHeight: number = 280
  private margin: number = 15

  // Column widths in mm (total must be < 180 for A4 with margins)
  private colWidths = [8, 99, 18, 23, 23]
  private totalWidth: number

  constructor() {
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })
    this.totalWidth = this.colWidths.reduce((a, b) => a + b, 0)
  }

  async generate(data: DeskResultBAData): Promise<Buffer> {
    this.doc.setFont("helvetica")

    // Header
    this.addHeader(data)

    // Entity Information
    this.addEntityInfo(data)

    // Signature Section (before table)
    await this.addSignatureSection(data)

    // NEW PAGE for table
    this.doc.addPage()
    this.yPos = 20

    // Table Header
    this.addTableHeader()

    // Table Data
    this.addTableData(data.materials)

    // Summary
    this.addSummary(data)

    // Footer
    this.addFooter()

    return Buffer.from(this.doc.output("arraybuffer"))
  }

  private addHeader(data: DeskResultBAData): void {
    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "bold")
    this.doc.text(
      "BERITA ACARA HASIL DESK USULAN KEBUTUHAN OBAT DAN VAKSIN PROGRAM",
      105,
      this.yPos,
      { align: "center" }
    )
    this.yPos += 6

    this.doc.setFontSize(12)
    this.doc.text(data.program_plan_name.toUpperCase(), 105, this.yPos, { align: "center" })
    this.yPos += 12
  }

  private addEntityInfo(data: DeskResultBAData): void {
    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "normal")

    const dateText = data.desk_date
      ? this.formatDateInWords(data.desk_date)
      : "........................"

    const programName = data.signature_kemenkes?.program || ""
    const signerPosition = data.signature_kemenkes?.signer_position || ""
    const lineHeight = 6
    const maxWidth = 180

    const timKerjaText = `TIM KERJA ${programName.toUpperCase()}, ${signerPosition.toUpperCase()}`

    // Paragraph 1: render inline with explicit bold segments
    const para1Segments: Array<{text: string, bold: boolean}> = [
      { text: `Pada hari ini ${dateText}, telah dilakukan desk usulan kebutuhan Obat program `, bold: false },
      { text: programName, bold: true },
      { text: ` yang dihadiri oleh `, bold: false },
      { text: data.entity_name, bold: true },
      { text: `  serta perwakilan dari `, bold: false },
      { text: timKerjaText, bold: true },
      { text: ".", bold: false },
    ]
    this.renderSegments(para1Segments, this.margin, maxWidth, lineHeight)

    // Empty line gap
    this.yPos += lineHeight

    // Paragraph 2: plain text
    const para2 = `Pada desk tersebut telah dilakukan perhitungan usulan kebutuhan Obat Program ${programName} ${data.program_plan_name} sebagaimana terlampir.`
    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(10)
    this.doc.splitTextToSize(para2, maxWidth).forEach((line: string) => {
      this.checkPageBreak(12)
      this.doc.text(line, this.margin, this.yPos)
      this.yPos += lineHeight
    })

    this.yPos += 8
  }

  /**
   * Render an array of bold/normal text segments inline, wrapping automatically at maxWidth.
   * Each segment is split by space; words are placed one-by-one so wrapping is precise.
   */
  private renderSegments(
    segments: Array<{text: string, bold: boolean}>,
    startX: number,
    maxWidth: number,
    lineHeight: number
  ): void {
    let currentX = startX
    this.checkPageBreak(12)

    for (const segment of segments) {
      this.doc.setFont("helvetica", segment.bold ? "bold" : "normal")
      this.doc.setFontSize(10)
      
      const words = segment.text.split(" ")

      for (let i = 0; i < words.length; i++) {
        const word = words[i]
        const isLastWord = i === words.length - 1
        const fullWord = word + (isLastWord ? "" : " ")
        const wordWidth = this.doc.getTextWidth(fullWord)

        // Wrap if needed
        if (currentX + wordWidth > startX + maxWidth && currentX > startX && word !== "") {
          this.yPos += lineHeight
          this.checkPageBreak(12)
          currentX = startX
        }

        if (word) {
          this.doc.text(word, currentX, this.yPos)
          currentX += this.doc.getTextWidth(word)
        }
        
        if (!isLastWord) {
          currentX += this.doc.getTextWidth(" ")
        }
      }
    }

    // Move to next line after paragraph
    this.yPos += lineHeight
  }

  private addTableHeader(): void {
    this.checkPageBreak(15)

    const headers = ["No", "Nama Material", "Satuan", "Usulan\nKabupaten/Kota", "Hasil Desk"]
    let xPos = this.margin

    const totalHeaderWidth = this.colWidths.reduce((a, b) => a + b, 0)

    this.doc.setFillColor(68, 114, 196)
    this.doc.rect(this.margin, this.yPos, totalHeaderWidth, 10, "F")

    this.doc.setFontSize(8)
    this.doc.setFont("helvetica", "bold")
    this.doc.setTextColor(255, 255, 255)

    headers.forEach((header, i) => {
      const width = this.colWidths[i] ?? 20
      this.doc.setDrawColor(255, 255, 255)
      this.doc.setLineWidth(0.1)
      this.doc.rect(xPos, this.yPos, width, 10, "S")

      // Handle multi-line headers
      const lines = header.split("\n")
      const lineHeight = 3.5
      if (lines.length > 1) {
        // Calculate total height and center vertically
        const totalTextHeight = lines.length * lineHeight
        const startY = this.yPos + (10 - totalTextHeight) / 2 + lineHeight / 2

        lines.forEach((line, idx) => {
          this.doc.text(line, xPos + width / 2, startY + (idx * lineHeight), { align: "center" })
        })
      } else {
        const singleLineY = this.yPos + (10 - lineHeight) / 2 + lineHeight / 2
        this.doc.text(header, xPos + width / 2, singleLineY, { align: "center" })
      }

      xPos += width
    })

    this.doc.setTextColor(0, 0, 0)
    this.doc.setFont("helvetica", "normal")
    this.yPos += 10
  }

  private addTableData(materials: DeskResultBAData["materials"]): void {
    this.doc.setFontSize(7)

    materials.forEach((material) => {
      this.checkPageBreak(10)

      let xPos = this.margin
      const values = [
        String(material.no),
        this.truncateText(material.name, 70),
        material.unit,
        this.formatNumber(material.procurement_proposal),
        this.formatNumber(material.desk_result),
      ]

      values.forEach((value, i) => {
        const width = this.colWidths[i] ?? 20
        this.doc.setDrawColor(200, 200, 200)
        this.doc.rect(xPos, this.yPos, width, 8)

        if (i === 1) {
          this.doc.text(value, xPos + 2, this.yPos + 5)
        } else {
          this.doc.text(value, xPos + width / 2, this.yPos + 5, { align: "center" })
        }

        xPos += width
      })

      this.yPos += 8
    })

    this.yPos += 10
  }

  private addSummary(data: DeskResultBAData): void {
    this.checkPageBreak(25)

    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("RINGKASAN", this.margin, this.yPos)
    this.yPos += 8

    this.doc.setFont("helvetica", "normal")
    const summary = [
      `Total Item: ${data.total_items}`,
      `Total Usulan Pengadaan: ${this.formatNumber(data.total_procurement_proposal)}`,
      `Total Hasil Desk: ${this.formatNumber(data.total_desk_result)}`,
    ]

    summary.forEach((line) => {
      this.doc.text(line, this.margin + 5, this.yPos)
      this.yPos += 6
    })

    this.yPos += 10
  }

  private async addSignatureSection(data: DeskResultBAData): Promise<void> {
    this.yPos += 10

    // Separator line
    const sectionY = this.yPos
    this.doc.setDrawColor(250, 250, 250)
    this.doc.line(this.margin, sectionY - 10, 195, sectionY - 10)

    const boxW = 80
    const boxH = 30
    const spacing = 10
    const totalWidth = 2 * boxW + spacing
    const startX = 105 - totalWidth / 2
    const startY = this.yPos + 8
    
    // Always render 2 columns: Tim Kerja (Left) and Entity/Kako (Right)

    // -- LEFT COLUMN: TIM KERJA (Kemenkes) --
    let leftX = startX
    const kemenkesProgram = data.signature_kemenkes?.program || ""
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(8)
    this.doc.text(`TIM KERJA ${kemenkesProgram.toUpperCase()},`, leftX + boxW / 2, startY + 3, { align: "center" })

    const kemenkesPosition = data.signature_kemenkes?.signer_position || ""
    if (kemenkesPosition) {
      this.doc.text(kemenkesPosition.toUpperCase(), leftX + boxW / 2, startY + 6, { align: "center" })
    }

    const boxY = startY + 14
    this.doc.setDrawColor(250, 250, 250)
    this.doc.setFillColor(250, 250, 250)
    this.doc.rect(leftX, boxY, boxW, boxH, "FD")

    if (data.signature_kemenkes?.signature_url) {
      await this.loadAndDrawSignature(data.signature_kemenkes.signature_url, leftX, boxY, boxW, boxH)
    } else {
      this.doc.setFontSize(8)
      this.doc.setTextColor(150, 150, 150)
      this.doc.text("(Tanda Tangan & Stempel)", leftX + boxW / 2, boxY + boxH / 2 + 3, { align: "center" })
      this.doc.setTextColor(0, 0, 0)
    }

    const lineY = boxY + boxH + 5
    this.doc.setDrawColor(200, 200, 200)
    this.doc.setLineWidth(0.3)
    this.doc.line(leftX, lineY, leftX + boxW, lineY)

    if (data.signature_kemenkes?.signer_name) {
      this.doc.setFont("helvetica", "bold")
      this.doc.setFontSize(8)
      this.doc.text(`(${data.signature_kemenkes.signer_name})`, leftX + boxW / 2, lineY + 6, { align: "center" })
    }

    // -- RIGHT COLUMN: KAKO / ENTITY --
    let rightX = startX + boxW + spacing
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(8)

    const kakoPosition = data.signature_kako?.signer_position || ""
    if (kakoPosition) {
      this.doc.text(kakoPosition.toUpperCase(), rightX + boxW / 2, startY + 4, { align: "center" })
    } else {
      this.doc.text(data.entity_name.toUpperCase(), rightX + boxW / 2, startY + 4, { align: "center" })
    }

    this.doc.setDrawColor(250, 250, 250)
    this.doc.setFillColor(250, 250, 250)
    this.doc.rect(rightX, boxY, boxW, boxH, "FD")

    if (data.signature_kako?.signature_url) {
      await this.loadAndDrawSignature(data.signature_kako.signature_url, rightX, boxY, boxW, boxH)
    } else {
      this.doc.setFontSize(8)
      this.doc.setTextColor(150, 150, 150)
      this.doc.text("(Tanda Tangan & Stempel)", rightX + boxW / 2, boxY + boxH / 2 + 3, { align: "center" })
      this.doc.setTextColor(0, 0, 0)
    }

    this.doc.setDrawColor(200, 200, 200)
    this.doc.setLineWidth(0.3)
    this.doc.line(rightX, lineY, rightX + boxW, lineY)

    if (data.signature_kako?.signer_name) {
      this.doc.setFont("helvetica", "bold")
      this.doc.setFontSize(8)
      this.doc.text(`(${data.signature_kako.signer_name})`, rightX + boxW / 2, lineY + 6, { align: "center" })
    }

    this.yPos = startY + 60
  }

  private async loadAndDrawSignature(url: string, x: number, y: number, width: number, height: number): Promise<void> {
    try {
      const downloadUrl = this.convertToDirectDownloadUrl(url)
      const response = await fetch(downloadUrl)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const arrayBuffer = await response.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString("base64")

      const contentType = response.headers.get("content-type") || "image/png"
      const format = contentType.includes("jpeg") || contentType.includes("jpg") ? "JPEG" : "PNG"
      const imgData = `data:${contentType};base64,${base64}`

      this.doc.addImage(imgData, format, x + 3, y + 2, width - 6, height - 4)
    } catch (error) {
      console.error("Failed to load signature image:", error)
    }
  }

  private addFooter(): void {
    const pageCount = this.doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i)
      this.doc.setFontSize(8)
      this.doc.setFont("helvetica", "normal")
      this.doc.text(`Halaman ${i} dari ${pageCount}`, 105, 290, { align: "center" })
    }
  }

  // ── Helpers ──

  private checkPageBreak(requiredSpace: number): void {
    if (this.yPos + requiredSpace > this.pageHeight) {
      this.doc.addPage()
      this.yPos = 20
    }
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  private formatDateInWords(dateStr: string): string {
    const date = new Date(dateStr)
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ]

    const dayName = days[date.getDay()]
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = this.numberToWords(date.getFullYear())

    return `${dayName}, ${this.numberToWords(day)} ${month} ${year}`
  }

  private numberToWords(num: number): string {
    const units = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan"]
    const teens = ["Sepuluh", "Sebelas", "Dua Belas", "Tiga Belas", "Empat Belas", "Lima Belas", "Enam Belas", "Tujuh Belas", "Delapan Belas", "Sembilan Belas"]
    const tens = ["", "", "Dua Puluh", "Tiga Puluh", "Empat Puluh", "Lima Puluh", "Enam Puluh", "Tujuh Puluh", "Delapan Puluh", "Sembilan Puluh"]

    if (num === 0) return "Nol"
    if (num < 10) return units[num] ?? ""
    if (num < 20) return teens[num - 10] ?? ""
    if (num < 100) {
      const ten = Math.floor(num / 10)
      const unit = num % 10
      const tenText = tens[ten] ?? ""
      const unitText = units[unit] ?? ""
      return unit === 0 ? tenText : `${tenText} ${unitText.toLowerCase()}`
    }
    if (num < 1000) {
      const hundred = Math.floor(num / 100)
      const remainder = num % 100
      if (remainder === 0) return `${units[hundred] ?? ""} Ratus`
      return `${units[hundred] ?? ""} Ratus ${this.numberToWords(remainder)}`
    }
    if (num < 2000) {
      const remainder = num - 1000
      return remainder === 0 ? "Seribu" : `Seribu ${this.numberToWords(remainder)}`
    }
    if (num < 10000) {
      const thousand = Math.floor(num / 1000)
      const remainder = num % 1000
      if (remainder === 0) return `${this.numberToWords(thousand)} Ribu`
      return `${this.numberToWords(thousand)} Ribu ${this.numberToWords(remainder)}`
    }
    // For larger years, just return the number
    return String(num)
  }

  private formatNumber(num: number): string {
    return num.toLocaleString("id-ID")
  }

  private truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength - 3) + "..." : text
  }

  /**
   * Convert Google Drive view/share URL to direct download URL.
   * Supports both /view and /uc?export=view formats.
   */
  private convertToDirectDownloadUrl(url: string): string {
    // Already a direct download URL
    if (url.includes("export=download")) return url

    // https://drive.google.com/file/d/FILE_ID/view → direct download
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (fileIdMatch?.[1]) {
      return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`
    }

    // https://drive.google.com/open?id=FILE_ID
    const openIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
    if (openIdMatch?.[1]) {
      return `https://drive.google.com/uc?export=download&id=${openIdMatch[1]}`
    }

    return url
  }
}

export async function generateDeskResultBAPDF(
  data: DeskResultBAData
): Promise<Buffer> {
  const generator = new DeskResultBAPDF()
  return await generator.generate(data)
}
