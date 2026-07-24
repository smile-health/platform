import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export const parseDownload = <T extends BlobPart>(
  data: T,
  fileNameWithFormat?: string
) => {
  const link = document.createElement('a')

  // Tell the browser to associate the response data to
  // the URL of the link we created above.
  link.href = window.URL.createObjectURL(new Blob([data]))

  // Tell the browser to download, not render, the file.
  link.setAttribute('download', fileNameWithFormat ?? 'report.xlsx')

  // Place the link in the DOM.
  document.body.appendChild(link)

  // Make the magic happen!
  link.click()
}

export async function exportElement(
  elementIds: string | string[],
  type: string,
  fileName: string = 'export',
  isRemoveHeight: boolean = false,
  isCompactPdf: boolean = false
): Promise<void> {
  const ids = Array.isArray(elementIds) ? elementIds : [elementIds]

  const elements: HTMLElement[] = []
  for (const id of ids) {
    const element = document.getElementById(id)
    if (element) {
      elements.push(element)
    } else {
      console.warn(`Element with ID "${id}" not found.`)
    }
  }

  if (elements.length === 0) {
    console.error('No elements found to export.')
    return
  }

  // SINGLE ELEMENT - Optimized to safely expand height constraints of LIVE DOM
  if (elements.length === 1) {
    const element = elements[0]
    const originalStyles: { el: HTMLElement; style: string | null; className: string | null }[] = []

    if (isRemoveHeight) {
      originalStyles.push({ 
        el: element, 
        style: element.getAttribute('style'),
        className: element.getAttribute('class')
      })
      element.style.cssText = (element.getAttribute('style') || '') + '; max-height: none !important; height: auto !important; overflow: visible !important;'

      const allChildren = element.querySelectorAll('*')
      allChildren.forEach((child: Element) => {
        if (child instanceof HTMLElement) {
          const computed = window.getComputedStyle(child)
          // ONLY modify elements strictly found with a max-height limit or clipping
          if (computed.maxHeight !== 'none' || child.scrollHeight > child.clientHeight) {
            originalStyles.push({ 
              el: child, 
              style: child.getAttribute('style'),
              className: child.getAttribute('class')
            })
            child.style.cssText += '; max-height: none !important; overflow: visible !important;'
          }
        }
      })

      // Allow reflow completely
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    try {
      // Check if element is extraordinarily tall to avoid browser memory limits/canvas max bounds
      const deviceScale = window.devicePixelRatio || 1
      // If height is over 3000px, applying a scale of 2 might hit 16384px/32767px canvas limits
      const isTooTall = element.scrollHeight > 4000
      const scaleFactor = isTooTall ? 1 : Math.max(1, deviceScale)

      const canvas = await html2canvas(element, {
        scale: scaleFactor,
        useCORS: true,
        // allowTaint is intentionally removed to prevent canvas auto-tainting causing SecurityError
        backgroundColor: '#ffffff',
        ...(isRemoveHeight && {
          height: element.scrollHeight,
          windowHeight: element.scrollHeight,
        }),
      })

      await downloadCanvas(canvas, type, fileName, isCompactPdf)
    } catch (e) {
      console.error(e)
      alert("Terjadi masalah saat melukis grafik: " + e)
    } finally {
      if (isRemoveHeight) {
        originalStyles.forEach(({ el, style, className }) => {
          if (className !== null) {
            el.setAttribute('class', className)
          } else {
            el.removeAttribute('class')
          }
          if (style !== null) {
            el.setAttribute('style', style)
          } else {
            el.removeAttribute('style')
          }
        })
      }
    }
    return
  }

  // MULTIPLE ELEMENTS WRAPPER MODE
  const wrapper = document.createElement('div')
  wrapper.style.position = 'absolute'
  wrapper.style.left = '-9999px'
  wrapper.style.top = '0'

  elements.forEach((element) => {
    const clonedElement = cloneElementWithCanvas(element)
    clonedElement.style.padding = '0 4px'
    if (isRemoveHeight) {
        clonedElement.style.cssText += '; max-height: none !important; height: auto !important; overflow: visible !important;'
    }
    wrapper.appendChild(clonedElement)
  })

  document.body.appendChild(wrapper)

  await new Promise((resolve) => setTimeout(resolve, 200))

  try {
    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    })

    await downloadCanvas(canvas, type, fileName, isCompactPdf)
  } catch (error) {
    console.error(error)
  } finally {
    document.body.removeChild(wrapper)
  }
}

// Helper function to clone element and preserve canvas content
function cloneElementWithCanvas(element: HTMLElement): HTMLElement {
  const clone = element.cloneNode(true) as HTMLElement
  const originalCanvases = element.querySelectorAll('canvas')
  const clonedCanvases = clone.querySelectorAll('canvas')

  originalCanvases.forEach((originalCanvas, index) => {
    const clonedCanvas = clonedCanvases[index]
    if (clonedCanvas) {
      const context = clonedCanvas.getContext('2d')
      if (context) {
        clonedCanvas.width = originalCanvas.width
        clonedCanvas.height = originalCanvas.height
        context.drawImage(originalCanvas, 0, 0)
      }
    }
  })
  return clone
}

// Helper function to handle download properly via Promises
function downloadCanvas(
  canvas: HTMLCanvasElement,
  type: string,
  fileName: string,
  isCompactPdf: boolean = false
): Promise<void> {
  return new Promise((resolve) => {
    if (canvas.width === 0 || canvas.height === 0) {
      console.error('Canvas cannot be downloaded since it has 0 dimension')
      resolve()
      return
    }

    if (type === 'jpg' || type === 'png') {
      const mimeType = type === 'jpg' ? 'image/jpeg' : 'image/png'
      try {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.error('Failed to create blob from canvas. Data might be corrupted.')
              resolve()
              return
            }
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${fileName}.${type}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            setTimeout(() => URL.revokeObjectURL(url), 2000)
            resolve()
          },
          mimeType,
          1.0
        )
      } catch (e) {
         console.error('Blob generation error:', e)
         alert('Gagal merender gambar canvas karena isu sekuriti origin.')
         resolve()
      }
      return
    }

    if (type === 'pdf') {
      try {
        const imageFormat = isCompactPdf ? 'JPEG' : 'PNG'
        const mimeType = isCompactPdf ? 'image/jpeg' : 'image/png'
        const quality = isCompactPdf ? 0.85 : 1.0
        const dataUrl = canvas.toDataURL(mimeType, quality)
        if (!dataUrl || dataUrl === 'data:,') {
            console.error('DataURL corruputed.')
            resolve()
            return
        }

        const pdf = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: 'a4',
          compress: isCompactPdf,
        })
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight() // 297mm

        const imgWidth = pageWidth
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        if (isNaN(imgHeight) || isNaN(imgWidth) || imgHeight <= 0) {
            console.error('Invalid calculations passed to PDF renderer.')
            resolve()
            return
        }

        const imageAlias = `chart-${Date.now()}`
        let position = 0
        pdf.addImage(dataUrl, imageFormat, 0, position, imgWidth, imgHeight, imageAlias, isCompactPdf ? 'FAST' : undefined)
        let heightLeft = imgHeight - pageHeight

        // Generate multiple pages for extremely tall graphs!
        while (heightLeft > 0) {
          position -= pageHeight
          pdf.addPage()
          pdf.addImage(dataUrl, imageFormat, 0, position, imgWidth, imgHeight, imageAlias, isCompactPdf ? 'FAST' : undefined)
          heightLeft -= pageHeight
        }

        pdf.save(`${fileName}.pdf`)
      } catch (err) {
        console.error(err)
        alert('Gagal mendownload PDF: ' + err)
      }
      resolve()
      return
    }

    console.warn('Tipe file tidak didukung:', type)
    resolve()
  })
}

export const base64ToBlob = (base64: string, mimeType: string) => {
  const byteCharacters = atob(base64)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512)

    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  return new Blob(byteArrays, { type: mimeType })
}

export const downloadBase64 = (
  base64: string,
  filename: string,
  mimeType: string
) => {
  const blob = base64ToBlob(base64, mimeType)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
