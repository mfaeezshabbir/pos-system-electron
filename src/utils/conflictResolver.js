export class ConflictResolver {
  static async resolveInventoryConflict(localData, remoteData) {
    // Compare timestamps
    if (new Date(remoteData.updatedAt) > new Date(localData.updatedAt)) {
      return remoteData
    }
    
    // Merge quantities if both were updated
    if (localData.stockUpdated && remoteData.stockUpdated) {
      return {
        ...remoteData,
        stock: Math.min(localData.stock, remoteData.stock),
        conflictResolved: true,
        conflictDetails: {
          localStock: localData.stock,
          remoteStock: remoteData.stock,
          resolution: 'Used minimum stock value'
        }
      }
    }
    
    return localData
  }

  static async resolveTransactionConflict(localTx, remoteTx) {
    // For transactions, newer always wins as they should be immutable
    if (new Date(remoteTx.timestamp) > new Date(localTx.timestamp)) {
      return remoteTx
    }
    return localTx
  }

  static async resolveCustomerConflict(localCustomer, remoteCustomer) {
    // Merge customer data, keeping most recent changes
    return {
      ...localCustomer,
      ...remoteCustomer,
      transactions: mergeTransactions(
        localCustomer.transactions,
        remoteCustomer.transactions
      ),
      updatedAt: new Date().toISOString()
    }
  }
}

function mergeTransactions(localTx, remoteTx) {
  const txMap = new Map()
  
  // Add all transactions, remote ones override local if same ID
  ;[...localTx, ...remoteTx].forEach(tx => {
    txMap.set(tx.id, tx)
  })
  
  return Array.from(txMap.values())
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
} 