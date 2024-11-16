import { create } from 'zustand'
import { dbOperations, STORES } from '../utils/db'
import dayjs from 'dayjs'
import useCustomerStore from './useCustomerStore'

const useTransactionStore = create((set, get) => ({
    transactions: [],
    loading: false,
    error: null,

    loadTransactions: async () => {
        try {
            set({ loading: true });
            const transactions = await dbOperations.getAll(STORES.TRANSACTIONS);
            set({ transactions, loading: false });
        } catch (error) {
            console.error('Failed to load transactions:', error);
            set({ error: error.message, loading: false });
        }
    },

    getSalesSummary: (startDate, endDate) => {
        const transactions = get().transactions.filter(transaction => {
            const transactionDate = dayjs(transaction.timestamp);
            return transactionDate.isSameOrAfter(startDate, 'day') && 
                   transactionDate.isSameOrBefore(endDate, 'day') &&
                   (transaction.status === 'completed' || transaction.paymentMethod !== 'khata');
        });

        return transactions.reduce((summary, transaction) => {
            return {
                totalRevenue: summary.totalRevenue + (transaction.total || 0),
                netSales: summary.netSales + ((transaction.total || 0) - (transaction.tax || 0)),
                taxAmount: summary.taxAmount + (transaction.tax || 0),
                discountAmount: summary.discountAmount + (transaction.discount || 0),
                transactionCount: summary.transactionCount + 1
            };
        }, {
            totalRevenue: 0,
            netSales: 0,
            taxAmount: 0,
            discountAmount: 0,
            transactionCount: 0
        });
    },

    getPaymentMethodSummary: (startDate, endDate) => {
        const transactions = get().transactions.filter(transaction => {
            const transactionDate = dayjs(transaction.timestamp);
            return transactionDate.isSameOrAfter(startDate, 'day') && 
                   transactionDate.isSameOrBefore(endDate, 'day') &&
                   (transaction.status === 'completed' || transaction.paymentMethod !== 'khata');
        });

        return transactions.reduce((summary, transaction) => {
            const method = transaction.paymentMethod || 'unknown';
            return {
                ...summary,
                [method]: (summary[method] || 0) + (transaction.total || 0)
            };
        }, {});
    },

    addTransaction: async (transaction) => {
        try {
            set({ loading: true });
            await dbOperations.add(STORES.TRANSACTIONS, transaction);
            set(state => ({
                transactions: [transaction, ...state.transactions],
                loading: false
            }));
            return true;
        } catch (error) {
            console.error('Failed to add transaction:', error);
            set({ error: error.message, loading: false });
            return false;
        }
    },

    clearAllTransactions: async () => {
        try {
            set({ loading: true });
            await dbOperations.clearStore(STORES.TRANSACTIONS);
            set({ transactions: [], loading: false });
            return true;
        } catch (error) {
            console.error('Failed to clear transactions:', error);
            set({ error: error.message, loading: false });
            return false;
        }
    },

    updateTransactionStatus: async (transactionId, newStatus) => {
        try {
            const transaction = await dbOperations.get(STORES.TRANSACTIONS, transactionId);
            if (!transaction) return false;

            const updatedTransaction = {
                ...transaction,
                status: newStatus
            };

            await dbOperations.put(STORES.TRANSACTIONS, updatedTransaction);
            
            set(state => ({
                transactions: state.transactions.map(t =>
                    t.id === transactionId ? updatedTransaction : t
                )
            }));

            if (transaction.paymentMethod === 'khata' && transaction.customer?.id) {
                const customerStore = useCustomerStore.getState();
                await customerStore.updateTransactionPaymentStatus(
                    transaction.customer.id,
                    transactionId,
                    newStatus === 'completed'
                );
            }

            return true;
        } catch (error) {
            console.error('Failed to update transaction status:', error);
            return false;
        }
    }
}));

export default useTransactionStore; 