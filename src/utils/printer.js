export const printOptions = {
  silent: false,
  printBackground: true,
  color: false,
  margin: {
    marginType: 'printableArea'
  },
  landscape: false,
  pagesPerSheet: 1,
  collate: false,
  copies: 1,
  header: 'Page header',
  footer: 'Page footer'
}

export const printReceipt = async (receiptData) => {
  try {
    const { printerName, copies, data } = receiptData
    
    const printOptions = {
      silent: true,
      printBackground: false,
      color: false,
      margin: {
        marginType: 'printableArea'
      },
      landscape: false,
      pagesPerSheet: 1,
      collate: false,
      copies: copies || 1,
      printerName: printerName
    }

    const result = await window.electron.printReceipt({
      data,
      options: printOptions
    })
    
    return result
  } catch (error) {
    console.error('Print error:', error)
    throw new Error('Failed to print receipt')
  }
} 