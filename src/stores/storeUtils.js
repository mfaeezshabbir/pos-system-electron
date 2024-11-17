import useTransactionStore from './useTransactionStore';
import useCustomerStore from './useCustomerStore';

export const updateTransactionInStores = async (transactionId, newStatus, customerId) => {
  try {
    if (!transactionId || typeof transactionId !== 'string') {
      console.error('Valid transaction ID string is required');
      return false;
    }

    const isPaid = newStatus === 'completed';
    const stringId = transactionId.toString();
    
    const transactionStore = useTransactionStore.getState();
    const customerStore = useCustomerStore.getState();

    const success = await transactionStore.updateTransactionStatus(stringId, newStatus);

    if (success && customerId) {
      return await customerStore.updateTransactionPaymentStatus(
        customerId, 
        stringId, 
        isPaid
      );
    }

    return success;
  } catch (error) {
    console.error('Failed to update transaction:', error);
    return false;
  }
}; 