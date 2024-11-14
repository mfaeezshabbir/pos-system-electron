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
    const result = await window.electron.printReceipt({
      ...receiptData,
      options: printOptions
    })
    return result
  } catch (error) {
    console.error('Print error:', error)
    throw new Error('Failed to print receipt')
  }
} 