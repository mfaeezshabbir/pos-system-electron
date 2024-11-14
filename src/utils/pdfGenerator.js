import { jsPDF } from 'jspdf'
import useSettingsStore from '../stores/useSettingsStore'
import { formatCurrency, formatDate, formatTime } from './formatters'

export const generateReceipt = (transaction) => {
  const { businessInfo, receiptSettings } = useSettingsStore.getState()
  const doc = new jsPDF({
    unit: 'mm',
    format: [80, 200] // Standard thermal receipt width
  })

  // Set font size
  doc.setFontSize(receiptSettings.fontSize)

  let yPos = 10
  const lineHeight = receiptSettings.fontSize / 3

  // Add logo if enabled
  if (receiptSettings.showLogo && businessInfo.logo) {
    doc.addImage(businessInfo.logo, 'JPEG', 10, yPos, 60, 20)
    yPos += 25
  }

  // Business info
  doc.text(businessInfo.name, 40, yPos, { align: 'center' })
  yPos += lineHeight
  doc.text(businessInfo.address, 40, yPos, { align: 'center' })
  yPos += lineHeight
  doc.text(businessInfo.phone, 40, yPos, { align: 'center' })
  yPos += lineHeight * 2

  // Transaction details
  doc.text(`Receipt #: ${transaction.id}`, 10, yPos)
  yPos += lineHeight
  doc.text(`Date: ${formatDate(transaction.timestamp)}`, 10, yPos)
  yPos += lineHeight
  doc.text(`Time: ${formatTime(transaction.timestamp)}`, 10, yPos)
  yPos += lineHeight * 2

  // Items
  transaction.items.forEach(item => {
    doc.text(item.name, 10, yPos)
    yPos += lineHeight
    doc.text(`${item.quantity} x ${formatCurrency(item.price)}`, 10, yPos)
    doc.text(formatCurrency(item.subtotal), 70, yPos, { align: 'right' })
    yPos += lineHeight
  })

  // Totals
  yPos += lineHeight
  doc.line(10, yPos, 70, yPos)
  yPos += lineHeight

  doc.text('Subtotal:', 10, yPos)
  doc.text(formatCurrency(transaction.subtotal), 70, yPos, { align: 'right' })
  yPos += lineHeight

  if (transaction.discount > 0) {
    doc.text('Discount:', 10, yPos)
    doc.text(`-${formatCurrency(transaction.discountAmount)}`, 70, yPos, { align: 'right' })
    yPos += lineHeight
  }

  doc.text('Tax:', 10, yPos)
  doc.text(formatCurrency(transaction.taxAmount), 70, yPos, { align: 'right' })
  yPos += lineHeight

  doc.setFontSize(receiptSettings.fontSize + 2)
  doc.text('Total:', 10, yPos)
  doc.text(formatCurrency(transaction.total), 70, yPos, { align: 'right' })

  // Footer
  if (receiptSettings.footer) {
    yPos += lineHeight * 2
    doc.setFontSize(receiptSettings.fontSize - 2)
    doc.text(receiptSettings.footer, 40, yPos, { align: 'center' })
  }

  return doc
}

export const generatePDF = ({ salesData, paymentData, dateRange }) => {
  const { businessInfo } = useSettingsStore.getState()
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(20)
  doc.text(businessInfo.name, 105, 20, { align: 'center' })
  
  doc.setFontSize(12)
  doc.text('Sales Report', 105, 30, { align: 'center' })
  doc.text(`${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`, 105, 40, { align: 'center' })
  
  // Sales Summary
  doc.setFontSize(16)
  doc.text('Sales Summary', 20, 60)
  
  doc.setFontSize(12)
  const summaryData = [
    ['Total Revenue:', formatCurrency(salesData.totalRevenue)],
    ['Net Sales:', formatCurrency(salesData.netSales)],
    ['Transaction Count:', salesData.transactionCount.toString()]
  ]
  
  let yPos = 70
  summaryData.forEach(([label, value]) => {
    doc.text(label, 30, yPos)
    doc.text(value, 120, yPos)
    yPos += 10
  })
  
  // Payment Methods
  doc.setFontSize(16)
  doc.text('Payment Methods', 20, yPos + 20)
  
  doc.setFontSize(12)
  yPos += 30
  Object.entries(paymentData).forEach(([method, data]) => {
    doc.text(method, 30, yPos)
    doc.text(`${formatCurrency(data.total)} (${data.count} transactions)`, 120, yPos)
    yPos += 10
  })
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  doc.setFontSize(10)
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }
  
  // Save the PDF
  doc.save(`sales_report_${formatDate(dateRange.startDate)}_${formatDate(dateRange.endDate)}.pdf`)
} 