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

  // Business info
  doc.text(businessInfo.name, 40, yPos, { align: 'center' })
  yPos += 5
  doc.text(businessInfo.address, 40, yPos, { align: 'center' })
  yPos += 5
  doc.text(businessInfo.phone, 40, yPos, { align: 'center' })
  yPos += 10

  // Transaction info
  doc.text(`Receipt #${transaction.id}`, 10, yPos)
  yPos += 5
  doc.text(`Date: ${formatDate(transaction.timestamp)}`, 10, yPos)
  yPos += 5
  doc.text(`Time: ${formatTime(transaction.timestamp)}`, 10, yPos)
  yPos += 5
  doc.text(`Customer: ${transaction.customerName || 'Walk-in'}`, 10, yPos)
  yPos += 10

  // Items
  transaction.items.forEach(item => {
    doc.text(item.name, 10, yPos)
    yPos += 5
    doc.text(`${item.quantity} x ${formatCurrency(item.price)}`, 10, yPos)
    doc.text(formatCurrency(item.subtotal), 70, yPos, { align: 'right' })
    yPos += 5
  })

  // Totals
  yPos += 5
  doc.line(10, yPos, 70, yPos)
  yPos += 5

  doc.text('Subtotal:', 10, yPos)
  doc.text(formatCurrency(transaction.subtotal), 70, yPos, { align: 'right' })
  yPos += 5

  if (transaction.discount > 0) {
    doc.text('Discount:', 10, yPos)
    doc.text(`-${formatCurrency(transaction.discountAmount)}`, 70, yPos, { align: 'right' })
    yPos += 5
  }

  doc.text('Tax:', 10, yPos)
  doc.text(formatCurrency(transaction.taxAmount), 70, yPos, { align: 'right' })
  yPos += 5

  doc.setFontSize(receiptSettings.fontSize + 2)
  doc.text('Total:', 10, yPos)
  doc.text(formatCurrency(transaction.total), 70, yPos, { align: 'right' })

  // Payment details
  yPos += 5
  doc.text('Payment Method:', 10, yPos)
  doc.text(transaction.paymentMethod.toUpperCase(), 70, yPos, { align: 'right' })
  yPos += 5

  if (transaction.paymentMethod === 'cash') {
    doc.text('Amount Paid:', 10, yPos)
    doc.text(formatCurrency(transaction.amountPaid), 70, yPos, { align: 'right' })
    yPos += 5

    if (transaction.change > 0) {
      doc.text('Change:', 10, yPos)
      doc.text(formatCurrency(transaction.change), 70, yPos, { align: 'right' })
      yPos += 5
    }
  } else if (transaction.paymentMethod === 'khata') {
    doc.text('Status:', 10, yPos)
    doc.text('CREDIT', 70, yPos, { align: 'right' })
    yPos += 5
    doc.text('Due Date:', 10, yPos)
    doc.text(formatDate(transaction.dueDate), 70, yPos, { align: 'right' })
    yPos += 5
  }

  // Footer
  if (receiptSettings.footer) {
    yPos += 5
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