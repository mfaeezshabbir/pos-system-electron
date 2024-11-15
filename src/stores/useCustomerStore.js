import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createJSONStorage } from 'zustand/middleware'

const useCustomerStore = create(
    persist(
        (set, get) => ({
            customers: [],

            addCustomer: (customer) => {
                const newCustomer = {
                    id: Date.now().toString(),
                    name: customer.name,
                    phone: customer.phone,
                    creditLimit: customer.creditLimit || 0,
                    currentCredit: 0,
                    transactions: [],
                    createdAt: new Date().toISOString()
                }
                set(state => ({
                    customers: [...state.customers, newCustomer]
                }))
                return newCustomer
            },

            updateCustomer: (id, updates) => {
                set(state => ({
                    customers: state.customers.map(c =>
                        c.id === id ? { ...c, ...updates } : c
                    )
                }))
            },

            addKhataTransaction: (customerId, transaction) => {
                const customer = get().customers.find(c => c.id === customerId)
                if (!customer) return false

                const newTotal = customer.currentCredit + transaction.total
                if (newTotal > customer.creditLimit) return false

                set(state => ({
                    customers: state.customers.map(c =>
                        c.id === customerId
                            ? {
                                ...c,
                                currentCredit: newTotal,
                                transactions: [...c.transactions, {
                                    ...transaction,
                                    type: 'khata',
                                    timestamp: new Date().toISOString(),
                                    status: 'pending'
                                }]
                            }
                            : c
                    )
                }))
                return true
            },

            makePayment: (customerId, amount) => {
                const customer = get().customers.find(c => c.id === customerId)
                if (!customer || amount > customer.currentCredit) return false

                const paymentTransaction = {
                    id: Date.now().toString(),
                    type: 'payment',
                    amount: amount,
                    timestamp: new Date().toISOString(),
                    status: 'completed'
                }

                set(state => ({
                    customers: state.customers.map(c =>
                        c.id === customerId
                            ? {
                                ...c,
                                currentCredit: c.currentCredit - amount,
                                transactions: [...c.transactions, paymentTransaction]
                            }
                            : c
                    )
                }))
                return true
            },

            getCustomer: (id) => get().customers.find(c => c.id === id),
            getAllCustomers: () => get().customers
        }),
        {
            name: 'customer-storage',
            storage: createJSONStorage(() => localStorage)
        }
    )
)

export default useCustomerStore 