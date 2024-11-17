import { updateTransactionInStores } from '../stores/storeUtils';

const handleTransactionStatusUpdate = async (transaction, customerId, updateFn, notifyFn) => {
    try {
        if (!transaction?.id) {
            console.error('Transaction ID is required');
            return false;
        }

        if (transaction.paymentMethod !== "khata") {
            console.error('Only khata transactions can be updated');
            return false;
        }

        const isPaid = !transaction.isPaid;
        const newStatus = isPaid ? "completed" : "unpaid";

        const success = await updateFn(
            customerId,
            transaction.id,
            isPaid
        );

        if (success) {
            notifyFn({
                type: "success",
                message: `Transaction marked as ${isPaid ? 'paid' : 'unpaid'}`
            });
        }
        return success;
    } catch (error) {
        console.error("Error updating status:", error);
        notifyFn({
            type: "error",
            message: "Failed to update status"
        });
        return false;
    }
};

export { handleTransactionStatusUpdate }; 