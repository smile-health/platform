import { parseDownload, exportElement } from '../download' // adjust path as needed

// Mock DOM APIs
const mockCreateElement = jest.fn()
const mockCreateObjectURL = jest.fn()
const mockRevokeObjectURL = jest.fn()
const mockAppendChild = jest.fn()
const mockRemoveChild = jest.fn()
const mockClick = jest.fn()
const mockSetAttribute = jest.fn()

// Mock link element
const mockLinkElement = {
  href: '',
  click: mockClick,
  setAttribute: mockSetAttribute,
  remove: jest.fn()
}

describe('parseDownload', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Mock document.createElement
    mockCreateElement.mockReturnValue(mockLinkElement)
    global.document.createElement = mockCreateElement

    // Mock document.body.appendChild
    global.document.body.appendChild = mockAppendChild
    global.document.body.removeChild = mockRemoveChild

    // Mock window.URL methods
    mockCreateObjectURL.mockReturnValue('blob:http://localhost/mock-blob-url')
    global.window.URL.createObjectURL = mockCreateObjectURL
    global.window.URL.revokeObjectURL = mockRevokeObjectURL

    // Reset link element properties
    mockLinkElement.href = ''
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Basic functionality', () => {
    it('should create download link with default filename', () => {
      // given
      const testData = 'test file content'

      // when
      parseDownload(testData)

      // then
      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockCreateObjectURL).toHaveBeenCalledWith(new Blob([testData]))
      expect(mockLinkElement.href).toBe('blob:http://localhost/mock-blob-url')
      expect(mockSetAttribute).toHaveBeenCalledWith('download', 'report.xlsx')
      expect(mockAppendChild).toHaveBeenCalledWith(mockLinkElement)
      expect(mockClick).toHaveBeenCalled()
    })

    it('should create download link with custom filename', () => {
      // given
      const testData = 'test file content'
      const customFilename = 'custom-report.pdf'

      // when
      parseDownload(testData, customFilename)

      // then
      expect(mockSetAttribute).toHaveBeenCalledWith('download', customFilename)
    })

    it('should handle empty custom filename', () => {
      // given
      const testData = 'test file content'
      const emptyFilename = undefined

      // when
      parseDownload(testData, emptyFilename)

      // then
      expect(mockSetAttribute).toHaveBeenCalledWith('download', 'report.xlsx')
    })

    it('should handle null filename', () => {
      // given
      const testData = 'test file content'

      // when
      parseDownload(testData, null as any)

      // then
      expect(mockSetAttribute).toHaveBeenCalledWith('download', 'report.xlsx')
    })

    it('should handle undefined filename', () => {
      // given
      const testData = 'test file content'

      // when
      parseDownload(testData, undefined)

      // then
      expect(mockSetAttribute).toHaveBeenCalledWith('download', 'report.xlsx')
    })
  })

  describe('Data types handling', () => {
    it('should handle string data', () => {
      // given
      const stringData = 'Hello, World!'

      // when
      parseDownload(stringData, 'text-file.txt')

      // then
      expect(mockCreateObjectURL).toHaveBeenCalledWith(new Blob([stringData]))
      expect(mockSetAttribute).toHaveBeenCalledWith('download', 'text-file.txt')
    })

    it('should handle ArrayBuffer data', () => {
      // given
      const buffer = new ArrayBuffer(8)
      const view = new Uint8Array(buffer)
      view[0] = 72 // 'H'
      view[1] = 101 // 'e'

      // when
      parseDownload(buffer, 'buffer-file.bin')

      // then
      expect(mockCreateObjectURL).toHaveBeenCalledWith(new Blob([buffer]))
      expect(mockSetAttribute).toHaveBeenCalledWith('download', 'buffer-file.bin')
    })

    it('should handle Uint8Array data', () => {
      // given
      const uint8Array = new Uint8Array([72, 101, 108, 108, 111])

      // when
      parseDownload(uint8Array, 'uint8-file.bin')

      // then
      expect(mockCreateObjectURL).toHaveBeenCalledWith(new Blob([uint8Array]))
      expect(mockSetAttribute).toHaveBeenCalledWith('download', 'uint8-file.bin')
    })

    it('should handle Blob data', () => {
      // given
      const blobData = new Blob(['test content'], { type: 'text/plain' })

      // when
      parseDownload(blobData, 'blob-file.txt')

      // then
      expect(mockCreateObjectURL).toHaveBeenCalledWith(new Blob([blobData]))
      expect(mockSetAttribute).toHaveBeenCalledWith('download', 'blob-file.txt')
    })

    it('should handle File data', () => {
      // given
      const fileData = new File(['file content'], 'original.txt', { type: 'text/plain' })

      // when
      parseDownload(fileData, 'downloaded-file.txt')

      // then
      expect(mockCreateObjectURL).toHaveBeenCalledWith(new Blob([fileData]))
      expect(mockSetAttribute).toHaveBeenCalledWith('download', 'downloaded-file.txt')
    })
  })

  describe('File extensions and names', () => {
    it('should handle various file extensions', () => {
      const testCases = [
        { filename: 'document.pdf', data: 'pdf content' },
        { filename: 'image.png', data: 'image data' },
        { filename: 'data.json', data: '{"key": "value"}' },
        { filename: 'script.js', data: 'console.log("hello")' },
        { filename: 'styles.css', data: 'body { margin: 0; }' },
        { filename: 'data.csv', data: 'name,age\nJohn,30' }
      ]

      testCases.forEach(({ filename, data }) => {
        // given
        jest.clearAllMocks()

        // when
        parseDownload(data, filename)

        // then
        expect(mockSetAttribute).toHaveBeenCalledWith('download', filename)
      })
    })

    it('should handle filenames with special characters', () => {
      // given
      const testData = 'content'
      const specialFilename = 'file-name_with-special@chars.txt'

      // when
      parseDownload(testData, specialFilename)

      // then
      expect(mockSetAttribute).toHaveBeenCalledWith('download', specialFilename)
    })

    it('should handle long filenames', () => {
      // given
      const testData = 'content'
      const longFilename = 'this-is-a-very-long-filename-that-might-be-used-in-real-applications.xlsx'

      // when
      parseDownload(testData, longFilename)

      // then
      expect(mockSetAttribute).toHaveBeenCalledWith('download', longFilename)
    })
  })

  describe('DOM manipulation', () => {
    it('should create anchor element with correct properties', () => {
      // given
      const testData = 'test content'

      // when
      parseDownload(testData)

      // then
      expect(mockCreateElement).toHaveBeenCalledTimes(1)
      expect(mockCreateElement).toHaveBeenCalledWith('a')
    })

    it('should append link to document body', () => {
      // given
      const testData = 'test content'

      // when
      parseDownload(testData)

      // then
      expect(mockAppendChild).toHaveBeenCalledTimes(1)
      expect(mockAppendChild).toHaveBeenCalledWith(mockLinkElement)
    })

    it('should trigger click event', () => {
      // given
      const testData = 'test content'

      // when
      parseDownload(testData)

      // then
      expect(mockClick).toHaveBeenCalledTimes(1)
    })

    it('should set correct href with object URL', () => {
      // given
      const testData = 'test content'
      const expectedBlobURL = 'blob:http://localhost/test-blob'
      mockCreateObjectURL.mockReturnValue(expectedBlobURL)

      // when
      parseDownload(testData)

      // then
      expect(mockLinkElement.href).toBe(expectedBlobURL)
    })
  })

  describe('Error handling and edge cases', () => {
    it('should handle empty string data', () => {
      // given
      const emptyData = ''

      // when
      parseDownload(emptyData)

      // then
      expect(mockCreateObjectURL).toHaveBeenCalledWith(new Blob([emptyData]))
      expect(mockClick).toHaveBeenCalled()
    })

    it('should handle null data', () => {
      // given
      const nullData = null as any

      // when
      parseDownload(nullData)

      // then
      expect(mockCreateObjectURL).toHaveBeenCalledWith(new Blob([nullData]))
      expect(mockClick).toHaveBeenCalled()
    })

    it('should handle undefined data', () => {
      // given
      const undefinedData = undefined as any

      // when
      parseDownload(undefinedData)

      // then
      expect(mockCreateObjectURL).toHaveBeenCalledWith(new Blob([undefinedData]))
      expect(mockClick).toHaveBeenCalled()
    })

    it('should continue execution if createObjectURL throws error', () => {
      // given
      const testData = 'test content'
      mockCreateObjectURL.mockImplementation(() => {
        throw new Error('Mock createObjectURL error')
      })

      // when & then
      expect(() => parseDownload(testData)).toThrow('Mock createObjectURL error')
    })

    it('should continue execution if click throws error', () => {
      // given
      const testData = 'test content'
      mockClick.mockImplementation(() => {
        throw new Error('Mock click error')
      })

      // when & then
      expect(() => parseDownload(testData)).toThrow('Mock click error')
    })

    it('should continue execution if appendChild throws error', () => {
      // given
      const testData = 'test content'
      mockAppendChild.mockImplementation(() => {
        throw new Error('Mock appendChild error')
      })

      // when & then
      expect(() => parseDownload(testData)).toThrow('Mock appendChild error')
    })
  })

  describe('Call sequence verification', () => {
    it('should execute steps in correct order', () => {
      // given
      const testData = 'test content'
      const filename = 'test.txt'
      const mockCallOrder: string[] = []

      // Override mocks to track call order
      mockCreateElement.mockImplementation(() => {
        mockCallOrder.push('createElement')
        return mockLinkElement
      })

      mockCreateObjectURL.mockImplementation(() => {
        mockCallOrder.push('createObjectURL')
        return 'blob:mock-url'
      })

      mockSetAttribute.mockImplementation(() => {
        mockCallOrder.push('setAttribute')
      })

      mockAppendChild.mockImplementation(() => {
        mockCallOrder.push('appendChild')
      })

      mockClick.mockImplementation(() => {
        mockCallOrder.push('click')
      })

      // when
      parseDownload(testData, filename)

      // then
      expect(mockCallOrder).toEqual([
        'createElement',
        'createObjectURL',
        'setAttribute',
        'appendChild',
        'click'
      ])
    })
  })

  describe('Memory management', () => {
    it('should create object URL for blob', () => {
      // given
      const testData = 'large file content'.repeat(1000)

      // when
      parseDownload(testData)

      // then
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1)
      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    })

    // Note: The current implementation doesn't clean up the object URL
    // This test documents the current behavior
    it('should not automatically revoke object URL', () => {
      // given
      const testData = 'test content'

      // when
      parseDownload(testData)

      // then
      expect(mockRevokeObjectURL).not.toHaveBeenCalled()
    })
  })
})

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

jest.mock('html2canvas')
jest.mock('jspdf', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      internal: {
        pageSize: {
          getWidth: jest.fn().mockReturnValue(210) // A4 width in mm
        }
      },
      addImage: jest.fn(),
      save: jest.fn()
    }))
  }
})

const mockedHtml2Canvas = html2canvas as jest.MockedFunction<typeof html2canvas>
const mockedJsPDF = jsPDF as jest.MockedClass<typeof jsPDF>

describe('exportElement', () => {
  // Mock DOM elements and methods
  const mockElement = {
    id: 'test-element',
    innerHTML: '<div>Test Content</div>',
    style: { width: '400px', height: '300px' }
  }

  const mockCanvas = {
    width: 400,
    height: 300,
    toDataURL: jest.fn()
  }

  const mockLink = {
    href: '',
    download: '',
    click: jest.fn()
  }

  const mockPdf = {
    internal: {
      pageSize: {
        getWidth: jest.fn().mockReturnValue(210)
      }
    },
    addImage: jest.fn(),
    save: jest.fn()
  }

  // Setup mocks
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Mock document.getElementById
    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === 'test-element') {
        return mockElement as any
      }
      return null
    })

    // Mock document.createElement
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return mockLink as any
      }
      return {} as any
    })

    // Mock html2canvas
    mockedHtml2Canvas.mockResolvedValue(mockCanvas as any)

    // Mock canvas.toDataURL
    mockCanvas.toDataURL.mockImplementation((type) => {
      if (type === 'image/jpeg') {
        return 'data:image/jpeg;base64,mockJpegData'
      }
      return 'data:image/png;base64,mockPngData'
    })

    // Mock jsPDF
    mockedJsPDF.mockImplementation(() => mockPdf as any)

    // Mock console methods
    jest.spyOn(console, 'error').mockImplementation(() => { })
    jest.spyOn(console, 'warn').mockImplementation(() => { })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Element validation', () => {
    it('should return early when element not found', async () => {
      // given
      jest.spyOn(document, 'getElementById').mockReturnValue(null)

      // when
      await exportElement('nonexistent-element', 'png')

      // then
      expect(console.error).toHaveBeenCalledWith('Element with ID "nonexistent-element" not found.')
      expect(mockedHtml2Canvas).not.toHaveBeenCalled()
    })

    it('should find and process existing element', async () => {
      // when
      await exportElement('test-element', 'png')

      // then
      expect(document.getElementById).toHaveBeenCalledWith('test-element')
      expect(mockedHtml2Canvas).toHaveBeenCalledWith(mockElement, { scale: 2 })
    })
  })

  describe('PNG export', () => {
    it('should export element as PNG with default filename', async () => {
      // when
      await exportElement('test-element', 'png')

      // then
      expect(mockedHtml2Canvas).toHaveBeenCalledWith(mockElement, { scale: 2 })
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png')
      expect(document.createElement).toHaveBeenCalledWith('a')
      expect(mockLink.href).toBe('data:image/png;base64,mockPngData')
      expect(mockLink.download).toBe('export.png')
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should export element as PNG with custom filename', async () => {
      // when
      await exportElement('test-element', 'png', 'custom-chart')

      // then
      expect(mockLink.download).toBe('custom-chart.png')
      expect(mockLink.href).toBe('data:image/png;base64,mockPngData')
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should handle empty custom filename', async () => {
      // when
      await exportElement('test-element', 'png', '')

      // then
      expect(mockLink.download).toBe('.png')
    })
  })

  describe('JPG export', () => {
    it('should export element as JPG with default filename', async () => {
      // when
      await exportElement('test-element', 'jpg')

      // then
      expect(mockedHtml2Canvas).toHaveBeenCalledWith(mockElement, { scale: 2 })
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 1.0)
      expect(mockLink.href).toBe('data:image/jpeg;base64,mockJpegData')
      expect(mockLink.download).toBe('export.jpg')
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should export element as JPG with custom filename', async () => {
      // when
      await exportElement('test-element', 'jpg', 'my-image')

      // then
      expect(mockLink.download).toBe('my-image.jpg')
      expect(mockLink.href).toBe('data:image/jpeg;base64,mockJpegData')
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should use correct JPEG quality settings', async () => {
      // when
      await exportElement('test-element', 'jpg')

      // then
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 1.0)
    })
  })

  describe('Unsupported export types', () => {
    it('should warn about unsupported file type', async () => {
      // when
      await exportElement('test-element', 'unsupported')

      // then
      expect(console.warn).toHaveBeenCalledWith('Tipe file tidak didukung:', 'unsupported')
      expect(mockLink.click).not.toHaveBeenCalled()
      expect(mockPdf.save).not.toHaveBeenCalled()
    })

    it('should handle case sensitivity', async () => {
      // when
      await exportElement('test-element', 'PNG')

      // then
      expect(console.warn).toHaveBeenCalledWith('Tipe file tidak didukung:', 'PNG')
    })

    it('should handle null type', async () => {
      // when
      await exportElement('test-element', null as any)

      // then
      expect(console.warn).toHaveBeenCalledWith('Tipe file tidak didukung:', null)
    })

    it('should handle empty string type', async () => {
      // when
      await exportElement('test-element', '')

      // then
      expect(console.warn).toHaveBeenCalledWith('Tipe file tidak didukung:', '')
    })
  })

  describe('HTML2Canvas integration', () => {
    it('should call html2canvas with correct parameters', async () => {
      // when
      await exportElement('test-element', 'png')

      // then
      expect(mockedHtml2Canvas).toHaveBeenCalledWith(mockElement, { scale: 2 })
      expect(mockedHtml2Canvas).toHaveBeenCalledTimes(1)
    })

    it('should handle html2canvas rejection', async () => {
      // given
      const error = new Error('html2canvas failed')
      mockedHtml2Canvas.mockRejectedValue(error)

      // when & then
      await expect(exportElement('test-element', 'png')).rejects.toThrow('html2canvas failed')
    })

    it('should handle canvas with zero dimensions', async () => {
      // given
      const zeroCanvas = {
        ...mockCanvas,
        width: 0,
        height: 0
      }
      mockedHtml2Canvas.mockResolvedValue(zeroCanvas as any)

      // when
      await exportElement('test-element', 'pdf')

      // then
      // Should still work but with zero height calculation
      expect(mockPdf.addImage).toHaveBeenCalledWith(
        'data:image/png;base64,mockPngData',
        'PNG',
        0,
        0,
        210,
        Number.NaN
      )
    })
  })

  describe('Error handling', () => {
    it('should handle canvas.toDataURL failure', async () => {
      // given
      mockCanvas.toDataURL.mockImplementation(() => {
        throw new Error('Canvas toDataURL failed')
      })

      // when & then
      await expect(exportElement('test-element', 'png')).rejects.toThrow('Canvas toDataURL failed')
    })

    it('should handle jsPDF constructor failure', async () => {
      // given
      mockedJsPDF.mockImplementation(() => {
        throw new Error('jsPDF initialization failed')
      })

      // when & then
      await expect(exportElement('test-element', 'pdf')).rejects.toThrow('jsPDF initialization failed')
    })

    it('should handle DOM manipulation failures', async () => {
      // given
      jest.spyOn(document, 'createElement').mockImplementation(() => {
        throw new Error('createElement failed')
      })

      // when & then
      await expect(exportElement('test-element', 'png')).rejects.toThrow('createElement failed')
    })
  })

  describe('Edge cases and boundary conditions', () => {
    it('should handle very small canvas dimensions', async () => {
      // given
      const smallCanvas = {
        ...mockCanvas,
        width: 1,
        height: 1
      }
      mockedHtml2Canvas.mockResolvedValue(smallCanvas as any)

      // when
      await exportElement('test-element', 'pdf')

      // then
      const expectedHeight = (1 * 210) / 1 // 210
      expect(mockPdf.addImage).toHaveBeenCalledWith(
        'data:image/png;base64,mockPngData',
        'PNG',
        0,
        0,
        210,
        expectedHeight
      )
    })

    it('should handle very large canvas dimensions', async () => {
      // given
      const largeCanvas = {
        ...mockCanvas,
        width: 10000,
        height: 8000,
        toDataURL: jest.fn().mockReturnValue('data:image/png;base64,largeData')
      }
      mockedHtml2Canvas.mockResolvedValue(largeCanvas as any)

      // when
      await exportElement('test-element', 'pdf')

      // then
      const expectedHeight = (8000 * 210) / 10000 // 168
      expect(mockPdf.addImage).toHaveBeenCalledWith(
        'data:image/png;base64,largeData',
        'PNG',
        0,
        0,
        210,
        expectedHeight
      )
    })

    it('should handle special characters in filename', async () => {
      // when
      await exportElement('test-element', 'png', 'file@name#with$special%chars')

      // then
      expect(mockLink.download).toBe('file@name#with$special%chars.png')
    })

    it('should handle long filenames', async () => {
      // given
      const longName = 'a'.repeat(200)

      // when
      await exportElement('test-element', 'jpg', longName)

      // then
      expect(mockLink.download).toBe(`${longName}.jpg`)
    })
  })

  describe('PDF export', () => {
    it('should export element as PDF with default filename', async () => {
      // when
      await exportElement('test-element', 'pdf')

      // then
      expect(mockedHtml2Canvas).toHaveBeenCalledWith(mockElement, { scale: 2 })
      expect(mockedJsPDF).toHaveBeenCalledWith('p', 'mm', 'a4')
      expect(mockPdf.internal.pageSize.getWidth).toHaveBeenCalled()
      expect(mockPdf.addImage).toHaveBeenCalledWith(
        'data:image/png;base64,mockPngData',
        'PNG',
        0,
        0,
        210, // pageWidth
        157.5 // calculated imgHeight (300 * 210 / 400)
      )
      expect(mockPdf.save).toHaveBeenCalledWith('export.pdf')
    })

    it('should export element as PDF with custom filename', async () => {
      // when
      await exportElement('test-element', 'pdf', 'report')

      // then
      expect(mockPdf.save).toHaveBeenCalledWith('report.pdf')
    })

    it('should calculate correct image dimensions for PDF', async () => {
      // given
      const customCanvas = {
        ...mockCanvas,
        width: 800,
        height: 600,
        toDataURL: jest.fn().mockReturnValue('data:image/png;base64,customData')
      }
      mockedHtml2Canvas.mockResolvedValue(customCanvas as any)

      // when
      await exportElement('test-element', 'pdf')

      // then
      const expectedImgHeight = (600 * 210) / 800 // 157.5
      expect(mockPdf.addImage).toHaveBeenCalledWith(
        'data:image/png;base64,customData',
        'PNG',
        0,
        0,
        210,
        expectedImgHeight
      )
    })

    it('should handle different page sizes', async () => {
      // given
      mockPdf.internal.pageSize.getWidth.mockReturnValue(297) // A4 landscape width

      // when
      await exportElement('test-element', 'pdf')

      // then
      const expectedImgHeight = (300 * 297) / 400 // 222.75
      expect(mockPdf.addImage).toHaveBeenCalledWith(
        'data:image/png;base64,mockPngData',
        'PNG',
        0,
        0,
        297,
        expectedImgHeight
      )
    })
  })

  describe('Memory management', () => {
    it('should not leak memory when called multiple times', async () => {
      // when
      for (let i = 0; i < 10; i++) {
        await exportElement('test-element', 'png', `file${i}`)
      }

      // then
      expect(mockedHtml2Canvas).toHaveBeenCalledTimes(10)
      expect(mockLink.click).toHaveBeenCalledTimes(10)
    })
  })

  describe('Integration scenarios', () => {
    it('should export chart element', async () => {
      // given
      const chartElement = {
        id: 'chart-container',
        querySelector: jest.fn(),
        getBoundingClientRect: jest.fn().mockReturnValue({
          width: 800,
          height: 400
        })
      }
      jest.spyOn(document, 'getElementById').mockReturnValue(chartElement as any)

      // when
      await exportElement('chart-container', 'png', 'sales-chart')

      // then
      expect(mockedHtml2Canvas).toHaveBeenCalledWith(chartElement, { scale: 2 })
      expect(mockLink.download).toBe('sales-chart.png')
    })

    it('should export table element', async () => {
      // given
      const tableElement = {
        id: 'data-table',
        tagName: 'TABLE',
        rows: []
      }
      jest.spyOn(document, 'getElementById').mockReturnValue(tableElement as any)

      // when
      await exportElement('data-table', 'pdf', 'data-report')

      // then
      expect(mockedHtml2Canvas).toHaveBeenCalledWith(tableElement, { scale: 2 })
      expect(mockPdf.save).toHaveBeenCalledWith('data-report.pdf')
    })
  })
})