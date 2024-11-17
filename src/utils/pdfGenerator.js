import { jsPDF } from 'jspdf'
import useSettingsStore from '../stores/useSettingsStore'
import { formatCurrency, formatDate, formatTime } from './formatters'

export const generateReceipt = (transaction, receiptSettings) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200] // Standard thermal receipt width
  })

  // Define constants at the top
  const pageHeight = doc.internal.pageSize.height
  const centerX = 40 // Center position (80/2)
  const rightX = 70 // Right align position

  // Add this function to handle the footer after centerX is defined
  const addFooter = () => {
    doc.setFontSize(8)
    doc.text('Developed by: DigiSol 365 | www.digisol365.com\n0305-1414290', centerX, pageHeight - 10, { align: 'center' })
  }

  let yPos = 10

  // Add footer to first page
  addFooter()

  // Add footer to all pages
  doc.setPage(1)
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    addFooter()
  }

  // Business Name - Larger and Bold
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(transaction.businessDetails?.name || 'Business Name', centerX, yPos, { align: 'center' })
  yPos += 7

  // Business Details - Normal size
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  // Business Address
  if (transaction.businessDetails?.address) {
    const addressLines = doc.splitTextToSize(transaction.businessDetails.address, 60)
    addressLines.forEach(line => {
      doc.text(line, centerX, yPos, { align: 'center' })
      yPos += 5
    })
  }

  // Business Contact Info
  if (transaction.businessDetails?.phone) {
    doc.text(`Tel: ${transaction.businessDetails.phone}`, centerX, yPos, { align: 'center' })
    yPos += 5
  }

  // Only show email and website if not hidden in settings
  if (!receiptSettings.hideEmailWebsite) {
    if (transaction.businessDetails?.email) {
      doc.text(`Email: ${transaction.businessDetails.email}`, centerX, yPos, { align: 'center' })
      yPos += 5
    }

    if (transaction.businessDetails?.website) {
      doc.text(`Web: ${transaction.businessDetails.website}`, centerX, yPos, { align: 'center' })
      yPos += 5
    }
  }

  if (transaction.businessDetails?.taxId) {
    doc.text(`Tax ID: ${transaction.businessDetails.taxId}`, centerX, yPos, { align: 'center' })
    yPos += 5
  }

  // Add divider line
  yPos += 2
  doc.setLineWidth(0.1)
  doc.line(10, yPos, rightX, yPos)
  yPos += 5

  // Receipt Details
  doc.setFontSize(10)
  doc.text(`Receipt #${transaction.id}`, 10, yPos)
  yPos += 5
  doc.text(`Date: ${formatDate(transaction.timestamp)}`, 10, yPos)
  yPos += 5
  doc.text(`Time: ${formatTime(transaction.timestamp)}`, 10, yPos)
  yPos += 5
  doc.text(`Customer: ${transaction.customerName || 'Walk-in'}`, 10, yPos)
  yPos += 5
  doc.text(`Served by: ${transaction.cashierName || 'Staff'}`, 10, yPos)
  yPos += 8

  // Items Header
  doc.setFont('helvetica', 'bold')
  doc.text('Items', 10, yPos)
  yPos += 5

  // Items List with more details
  doc.setFont('helvetica', 'normal');
  if (Array.isArray(transaction.items) && transaction.items.length > 0) {
    transaction.items.forEach(item => {
      if (!item) return; // Skip if item is undefined

      // Item name and SKU if available
      doc.text(`${item.name || 'Unknown Item'}${item.sku ? ` (${item.sku})` : ''}`, 10, yPos);
      yPos += 4;
      // Quantity, unit price and subtotal
      const quantity = item.quantity || 0;
      const price = item.price || 0;
      const subtotal = quantity * price;

      doc.text(`${quantity} x ${formatCurrency(price)}`, 10, yPos);
      doc.text(formatCurrency(subtotal), rightX, yPos, { align: 'right' });
      yPos += 6;
    });
  } else {
    doc.text('No items', 10, yPos);
    yPos += 6;
  }

  // Totals section
  yPos += 2
  doc.line(10, yPos, rightX, yPos)
  yPos += 5

  // Subtotal, Discount, Tax, Total
  const totalsY = yPos
  doc.text('Subtotal:', 10, yPos)
  doc.text(formatCurrency(transaction.subtotal), rightX, yPos, { align: 'right' })
  yPos += 5

  if (transaction.discountAmount > 0) {
    doc.text(`Discount (${transaction.discountRate}%):`, 10, yPos)
    doc.text(`-${formatCurrency(transaction.discountAmount)}`, rightX, yPos, { align: 'right' })
    yPos += 5
  }

  doc.text(`Tax (${transaction.taxRate}%):`, 10, yPos)
  doc.text(formatCurrency(transaction.taxAmount), rightX, yPos, { align: 'right' })
  yPos += 5

  doc.setFont('helvetica', 'bold')
  doc.text('Total:', 10, yPos)
  doc.text(formatCurrency(transaction.total), rightX, yPos, { align: 'right' })
  yPos += 8

  // Payment Details
  doc.setFont('helvetica', 'normal')
  doc.text('Payment Method:', 10, yPos)
  doc.text(transaction.paymentMethod.toUpperCase(), rightX, yPos, { align: 'right' })
  yPos += 5

  if (transaction.paymentMethod === 'cash') {
    doc.text('Amount Paid:', 10, yPos)
    doc.text(formatCurrency(transaction.amountPaid), rightX, yPos, { align: 'right' })
    yPos += 5
    if (transaction.change > 0) {
      doc.text('Change:', 10, yPos)
      doc.text(formatCurrency(transaction.change), rightX, yPos, { align: 'right' })
      yPos += 5
    }
  } else if (transaction.paymentMethod === 'card') {
    if (transaction.cardType) {
      doc.text('Card Type:', 10, yPos)
      doc.text(transaction.cardType.toUpperCase(), rightX, yPos, { align: 'right' })
      yPos += 5
    }
    if (transaction.lastFourDigits) {
      doc.text('Card Number:', 10, yPos)
      doc.text(`****${transaction.lastFourDigits}`, rightX, yPos, { align: 'right' })
      yPos += 5
    }
  }

  // Footer
  if (receiptSettings.footer) {
    yPos += 8
    doc.setFontSize(8)
    doc.text(receiptSettings.footer, centerX, yPos, { align: 'center' })
    yPos += 5
  }

  // Return/Exchange Policy if exists
  if (receiptSettings.returnPolicy) {
    yPos += 3
    doc.setFontSize(8)
    doc.text(receiptSettings.returnPolicy, centerX, yPos, { align: 'center' })
  }

  // QR Code for digital copy if enabled
  if (receiptSettings.showQR) {
    yPos += 10
    // Add QR code implementation here
  }

  return doc
}

export const generatePDF = ({ salesData, paymentData, dateRange }) => {
  const { businessInfo } = useSettingsStore.getState()
  const doc = new jsPDF()

  // Header with logo
  if (businessInfo.logo) {
    try {
      doc.addImage(businessInfo.logo, 'PNG', 20, 10, 30, 30)
    } catch (error) {
      console.error('Error adding logo to report:', error)
    }
  }

  doc.setFontSize(20)
  doc.text(businessInfo.name, 105, 20, { align: 'center' })

  doc.setFontSize(12)
  doc.text('Sales Report', 105, 30, { align: 'center' })
  doc.text(`${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`, 105, 40, { align: 'center' })

  // Sales Summary with more metrics
  doc.setFontSize(16)
  doc.text('Sales Summary', 20, 60)

  doc.setFontSize(12)
  const summaryData = [
    ['Total Revenue:', formatCurrency(salesData.totalRevenue)],
    ['Net Sales:', formatCurrency(salesData.netSales)],
    ['Total Tax Collected:', formatCurrency(salesData.totalTax)],
    ['Total Discounts:', formatCurrency(salesData.totalDiscounts)],
    ['Transaction Count:', salesData.transactionCount.toString()],
    ['Average Transaction Value:', formatCurrency(salesData.averageTransactionValue)],
    ['Items Sold:', salesData.totalItemsSold.toString()]
  ]

  let yPos = 70
  summaryData.forEach(([label, value]) => {
    doc.text(label, 30, yPos)
    doc.text(value, 120, yPos)
    yPos += 10
  })

  // Payment Methods with percentages
  doc.setFontSize(16)
  doc.text('Payment Methods', 20, yPos + 20)

  doc.setFontSize(12)
  yPos += 30
  const totalTransactions = Object.values(paymentData).reduce((sum, data) => sum + data.count, 0)
  Object.entries(paymentData).forEach(([method, data]) => {
    const percentage = ((data.count / totalTransactions) * 100).toFixed(1)
    doc.text(method.toUpperCase(), 30, yPos)
    doc.text(`${formatCurrency(data.total)} (${data.count} transactions, ${percentage}%)`, 120, yPos)
    yPos += 10
  })

  // Top selling items section
  if (salesData.topItems && salesData.topItems.length > 0) {
    yPos += 10
    doc.setFontSize(16)
    doc.text('Top Selling Items', 20, yPos)

    doc.setFontSize(12)
    yPos += 10
    salesData.topItems.forEach(item => {
      doc.text(`${item.name}: ${item.quantity} units (${formatCurrency(item.revenue)})`, 30, yPos)
      yPos += 8
    })
  }

  // Footer with page numbers
  const pageCount = doc.internal.getNumberOfPages()
  doc.setFontSize(10)
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.text(
      `Page ${i} of ${pageCount} - Generated on ${formatDate(new Date())}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }

  // Save the PDF with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  doc.save(`sales_report_${formatDate(dateRange.startDate)}_${formatDate(dateRange.endDate)}_${timestamp}.pdf`)
} 