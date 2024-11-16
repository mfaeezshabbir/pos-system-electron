const DB_CONFIG = {
  name: 'posDB',
  version: 1,
  stores: {
    settings: {
      keyPath: 'id',
      indexes: []
    },
    transactions: {
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'customerId', keyPath: 'customerId' },
        { name: 'businessDetails', keyPath: 'businessDetails' }
      ]
    }
  }
}; 