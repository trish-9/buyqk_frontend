/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

const FinanceContext = createContext()

// =========================================
// SAFE LOCAL STORAGE
// =========================================

const getStorage = (key, fallback = []) => {
  try {
    const data = localStorage.getItem(key)

    if (!data) {
      return fallback
    }

    const parsed = JSON.parse(data)

    return parsed ?? fallback
  } catch {
    return fallback
  }
}

// =========================================
// FINANCE PROVIDER
// =========================================

export function FinanceProvider({ children }) {

  // =========================================
  // INCOME
  // =========================================

  const [incomes, setIncomes] = useState(() =>
    getStorage('incomes', [])
  )

  // =========================================
  // EXPENSES
  // =========================================

  const [expenses, setExpenses] = useState(() =>
    getStorage('expenses', [])
  )

  // =========================================
  // INVOICES
  // =========================================

  const [invoices, setInvoices] = useState(() =>
    getStorage('invoices', [])
  )

  // =========================================
  // PRODUCTS
  // =========================================

  const [products, setProducts] = useState(() =>
    getStorage('products', [])
  )

  // =========================================
  // CUSTOMERS
  // =========================================

  const [customers, setCustomers] = useState(() =>
    getStorage('customers', [])
  )

  // =========================================
  // VENDORS
  // =========================================

  const [vendors, setVendors] = useState(() =>
    getStorage('vendors', [])
  )

  // =========================================
  // NOTIFICATIONS
  // =========================================

  const [notifications, setNotifications] = useState(() =>
    getStorage('financeNotifications', [])
  )

  // =========================================
  // RELOAD DATA
  // =========================================

  useEffect(() => {

    const reloadFromStorage = () => {

      setIncomes(getStorage('incomes', []))
      setExpenses(getStorage('expenses', []))
      setInvoices(getStorage('invoices', []))
      setProducts(getStorage('products', []))
      setCustomers(getStorage('customers', []))
      setVendors(getStorage('vendors', []))
      setNotifications(
        getStorage('financeNotifications', [])
      )
    }

    window.addEventListener(
      'financeDataUpdated',
      reloadFromStorage
    )

    window.addEventListener(
      'storage',
      reloadFromStorage
    )

    return () => {

      window.removeEventListener(
        'financeDataUpdated',
        reloadFromStorage
      )

      window.removeEventListener(
        'storage',
        reloadFromStorage
      )
    }

  }, [])

  // =========================================
  // DISPATCH UPDATE
  // =========================================

  const dispatchUpdate = () => {

    window.dispatchEvent(
      new Event('financeDataUpdated')
    )
  }

  // =========================================
  // NOTIFICATION
  // =========================================

  const createNotification = ({
    type,
    title,
    message,
    path,
  }) => {

    const notification = {

      id:
        `${type}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,

      type,
      title,
      message,
      path,

      createdAt:
        new Date().toISOString(),

      read: false,
    }

    const current =
      getStorage(
        'financeNotifications',
        []
      )

    const updated = [
      notification,
      ...current,
    ].slice(0, 50)

    setNotifications(updated)

    localStorage.setItem(
      'financeNotifications',
      JSON.stringify(updated)
    )

    dispatchUpdate()
  }

  // =========================================
  // NOTIFICATION READ
  // =========================================

  const markNotificationAsRead = (id) => {

    const current =
      getStorage(
        'financeNotifications',
        []
      )

    const updated =
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              read: true,
            }
          : item
      )

    setNotifications(updated)

    localStorage.setItem(
      'financeNotifications',
      JSON.stringify(updated)
    )

    dispatchUpdate()
  }

  // =========================================
  // MARK ALL READ
  // =========================================

  const markAllNotificationsAsRead = () => {

    const current =
      getStorage(
        'financeNotifications',
        []
      )

    const updated =
      current.map((item) => ({
        ...item,
        read: true,
      }))

    setNotifications(updated)

    localStorage.setItem(
      'financeNotifications',
      JSON.stringify(updated)
    )

    dispatchUpdate()
  }

  // =========================================
  // CLEAR NOTIFICATIONS
  // =========================================

  const clearNotifications = () => {

    setNotifications([])

    localStorage.setItem(
      'financeNotifications',
      JSON.stringify([])
    )

    dispatchUpdate()
  }

  // =========================================
  // ADD INCOME
  // =========================================

  const addIncome = (data) => {

    const newIncome = {

      id: Date.now(),

      ...data,

      amount:
        Number(data.amount || 0),

      createdAt:
        new Date().toISOString(),
    }

    const updated = [
      newIncome,
      ...incomes,
    ]

    setIncomes(updated)

    localStorage.setItem(
      'incomes',
      JSON.stringify(updated)
    )

    createNotification({
      type: 'income',
      title: 'Income added',
      message:
        `₹${Number(
          data.amount || 0
        ).toLocaleString('en-IN')} income was added.`,
      path: '/income',
    })

    dispatchUpdate()

    return newIncome
  }

  // =========================================
  // DELETE INCOME
  // =========================================

  const deleteIncome = (id) => {

    const updated =
      incomes.filter(
        item => item.id !== id
      )

    setIncomes(updated)

    localStorage.setItem(
      'incomes',
      JSON.stringify(updated)
    )

    createNotification({
      type: 'income-delete',
      title: 'Income deleted',
      message: 'An income entry was deleted.',
      path: '/income',
    })

    dispatchUpdate()
  }

  // =========================================
  // ADD EXPENSE
  // =========================================

  const addExpense = (data) => {

    const newExpense = {

      id: Date.now(),

      ...data,

      amount:
        Number(data.amount || 0),

      createdAt:
        new Date().toISOString(),
    }

    const updated = [
      newExpense,
      ...expenses,
    ]

    setExpenses(updated)

    localStorage.setItem(
      'expenses',
      JSON.stringify(updated)
    )

    createNotification({
      type: 'expense',
      title: 'Expense added',
      message:
        `₹${Number(
          data.amount || 0
        ).toLocaleString('en-IN')} expense was added.`,
      path: '/expenses',
    })

    dispatchUpdate()

    return newExpense
  }

  // =========================================
  // DELETE EXPENSE
  // =========================================

  const deleteExpense = (id) => {

    const updated =
      expenses.filter(
        item => item.id !== id
      )

    setExpenses(updated)

    localStorage.setItem(
      'expenses',
      JSON.stringify(updated)
    )

    createNotification({
      type: 'expense-delete',
      title: 'Expense deleted',
      message: 'An expense entry was deleted.',
      path: '/expenses',
    })

    dispatchUpdate()
  }

  // =========================================
  // INVOICE OUTSTANDING
  // =========================================

  const getInvoiceOutstanding = (invoice) => {

    if (!invoice) {
      return 0
    }

    if (
      invoice.balanceDue !== undefined &&
      invoice.balanceDue !== null
    ) {
      return Math.max(
        0,
        Number(invoice.balanceDue || 0)
      )
    }

    const total =
      Number(
        invoice.total ??
        invoice.totalAmount ??
        invoice.grandTotal ??
        invoice.amount ??
        0
      )

    const paid =
      Number(
        invoice.paidAmount ??
        invoice.amountPaid ??
        invoice.paid ??
        0
      )

    return Math.max(
      0,
      total - paid
    )
  }

  // =========================================
  // INVOICE TOTAL
  // =========================================

  const getInvoiceTotal = (invoice) => {

    return Number(
      invoice?.total ??
      invoice?.totalAmount ??
      invoice?.grandTotal ??
      invoice?.amount ??
      0
    )
  }

  // =========================================
  // UPDATE CUSTOMER OUTSTANDING
  // =========================================

  const updateCustomerOutstanding = (
    customerId,
    amount
  ) => {

    if (
      customerId === undefined ||
      customerId === null ||
      customerId === ''
    ) {
      return
    }

    const change =
      Number(amount || 0)

    if (
      !Number.isFinite(change) ||
      change === 0
    ) {
      return
    }

    const updated =
      customers.map(customer => {

        if (
          String(customer.id) !==
          String(customerId)
        ) {
          return customer
        }

        return {

          ...customer,

          outstanding:
            Math.max(
              0,
              Number(
                customer.outstanding || 0
              ) + change
            ),

          updatedAt:
            new Date().toISOString(),
        }
      })

    setCustomers(updated)

    localStorage.setItem(
      'customers',
      JSON.stringify(updated)
    )
  }

  // =========================================
  // ADD INVOICE
  // =========================================

  const addInvoice = (data) => {

    const total =
      getInvoiceTotal(data)

    const paidAmount =
      Number(
        data.paidAmount ||
        data.amountPaid ||
        data.paid ||
        0
      )

    const balanceDue =
      Math.max(
        0,
        total - paidAmount
      )

    const newInvoice = {

      id: Date.now(),

      ...data,

      total,

      paidAmount,

      balanceDue,

      paymentStatus:
        balanceDue === 0
          ? 'Paid'
          : paidAmount > 0
            ? 'Partial'
            : 'Unpaid',

      createdAt:
        new Date().toISOString(),
    }

    const updated = [
      newInvoice,
      ...invoices,
    ]

    setInvoices(updated)

    localStorage.setItem(
      'invoices',
      JSON.stringify(updated)
    )

    if (
      newInvoice.customerId &&
      balanceDue > 0
    ) {

      updateCustomerOutstanding(
        newInvoice.customerId,
        balanceDue
      )
    }

    createNotification({
      type: 'invoice',
      title: 'Invoice created',
      message:
        `${newInvoice.invoiceNumber || 'New invoice'} was created.`,
      path: '/invoices',
    })

    dispatchUpdate()

    return newInvoice
  }

  // =========================================
  // UPDATE INVOICE
  // =========================================

  const updateInvoice = (
    id,
    data
  ) => {

    const oldInvoice =
      invoices.find(
        item => item.id === id
      )

    if (!oldInvoice) {
      return null
    }

    const updatedInvoice = {

      ...oldInvoice,

      ...data,

      updatedAt:
        new Date().toISOString(),
    }

    const oldOutstanding =
      getInvoiceOutstanding(
        oldInvoice
      )

    const newTotal =
      getInvoiceTotal(
        updatedInvoice
      )

    const newPaid =
      Number(
        updatedInvoice.paidAmount ||
        updatedInvoice.amountPaid ||
        updatedInvoice.paid ||
        0
      )

    const newOutstanding =
      Math.max(
        0,
        newTotal - newPaid
      )

    updatedInvoice.total =
      newTotal

    updatedInvoice.paidAmount =
      newPaid

    updatedInvoice.balanceDue =
      newOutstanding

    updatedInvoice.paymentStatus =
      newOutstanding === 0
        ? 'Paid'
        : newPaid > 0
          ? 'Partial'
          : 'Unpaid'

    const updated =
      invoices.map(item =>
        item.id === id
          ? updatedInvoice
          : item
      )

    setInvoices(updated)

    localStorage.setItem(
      'invoices',
      JSON.stringify(updated)
    )

    const oldCustomerId =
      oldInvoice.customerId

    const newCustomerId =
      updatedInvoice.customerId

    if (
      oldCustomerId &&
      String(oldCustomerId) ===
        String(newCustomerId)
    ) {

      const difference =
        newOutstanding -
        oldOutstanding

      if (difference !== 0) {

        updateCustomerOutstanding(
          oldCustomerId,
          difference
        )
      }

    } else {

      if (
        oldCustomerId &&
        oldOutstanding > 0
      ) {

        updateCustomerOutstanding(
          oldCustomerId,
          -oldOutstanding
        )
      }

      if (
        newCustomerId &&
        newOutstanding > 0
      ) {

        updateCustomerOutstanding(
          newCustomerId,
          newOutstanding
        )
      }
    }

    createNotification({
      type: 'invoice-update',
      title: 'Invoice updated',
      message:
        `${updatedInvoice.invoiceNumber || 'Invoice'} was updated.`,
      path: '/invoices',
    })

    dispatchUpdate()

    return updatedInvoice
  }

  // =========================================
  // DELETE INVOICE
  // =========================================

  const deleteInvoice = (id) => {

    const invoice =
      invoices.find(
        item => item.id === id
      )

    if (!invoice) {
      return
    }

    const outstanding =
      getInvoiceOutstanding(
        invoice
      )

    if (
      invoice.customerId &&
      outstanding > 0
    ) {

      updateCustomerOutstanding(
        invoice.customerId,
        -outstanding
      )
    }

    const updated =
      invoices.filter(
        item => item.id !== id
      )

    setInvoices(updated)

    localStorage.setItem(
      'invoices',
      JSON.stringify(updated)
    )

    createNotification({
      type: 'invoice-delete',
      title: 'Invoice deleted',
      message:
        `${invoice.invoiceNumber || 'Invoice'} was deleted.`,
      path: '/invoices',
    })

    dispatchUpdate()
  }

  // =========================================
  // ADD CUSTOMER
  // =========================================

  const addCustomer = (data) => {

    const openingBalance =
      Number(
        data.openingBalance || 0
      )

    const newCustomer = {

      id: Date.now(),

      name:
        data.name?.trim() || '',

      type:
        data.type || 'Business',

      gstin:
        data.gstin?.trim() || '',

      phone:
        data.phone?.trim() || '',

      email:
        data.email?.trim() || '',

      address:
        data.address?.trim() || '',

      creditLimit:
        Number(
          data.creditLimit || 0
        ),

      openingBalance,

      outstanding:
        openingBalance,

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),
    }

    const updated = [
      newCustomer,
      ...customers,
    ]

    setCustomers(updated)

    localStorage.setItem(
      'customers',
      JSON.stringify(updated)
    )

    createNotification({
      type: 'customer',
      title: 'Customer added',
      message:
        `${newCustomer.name} was added successfully.`,
      path: '/customers',
    })

    dispatchUpdate()

    return newCustomer
  }

  // =========================================
  // UPDATE CUSTOMER
  // =========================================

  const updateCustomer = (
    id,
    data
  ) => {

    const oldCustomer =
      customers.find(
        item => item.id === id
      )

    if (!oldCustomer) {
      return null
    }

    const updatedCustomer = {

      ...oldCustomer,

      ...data,

      name:
        data.name?.trim() ??
        oldCustomer.name,

      type:
        data.type ??
        oldCustomer.type,

      gstin:
        data.gstin?.trim() ??
        oldCustomer.gstin,

      phone:
        data.phone?.trim() ??
        oldCustomer.phone,

      email:
        data.email?.trim() ??
        oldCustomer.email,

      address:
        data.address?.trim() ??
        oldCustomer.address,

      creditLimit:
        Number(
          data.creditLimit ??
          oldCustomer.creditLimit
        ),

      outstanding:
        Number(
          data.outstanding ??
          oldCustomer.outstanding
        ),

      updatedAt:
        new Date().toISOString(),
    }

    const updated =
      customers.map(item =>
        item.id === id
          ? updatedCustomer
          : item
      )

    setCustomers(updated)

    localStorage.setItem(
      'customers',
      JSON.stringify(updated)
    )

    createNotification({
      type: 'customer-update',
      title: 'Customer updated',
      message:
        `${updatedCustomer.name} details were updated.`,
      path: '/customers',
    })

    dispatchUpdate()

    return updatedCustomer
  }

  // =========================================
  // DELETE CUSTOMER
  // =========================================

  const deleteCustomer = (id) => {

    const customer =
      customers.find(
        item => item.id === id
      )

    if (!customer) {
      return false
    }

    const customerInvoices =
      invoices.filter(
        invoice =>
          String(invoice.customerId) ===
          String(id)
      )

    if (customerInvoices.length > 0) {

      alert(
        'This customer cannot be deleted because invoices exist for this customer.'
      )

      return false
    }

    const updated =
      customers.filter(
        item => item.id !== id
      )

    setCustomers(updated)

    localStorage.setItem(
      'customers',
      JSON.stringify(updated)
    )

    createNotification({
      type: 'customer-delete',
      title: 'Customer deleted',
      message:
        `${customer.name} was removed.`,
      path: '/customers',
    })

    dispatchUpdate()

    return true
  }

  // =========================================
  // RECORD CUSTOMER PAYMENT
  // =========================================

  const recordCustomerPayment = ({
    customerId,
    invoiceId,
    amount,
    paymentMethod = 'Cash',
    reference = '',
    notes = '',
    date = new Date().toISOString(),
  }) => {

    const paymentAmount =
      Number(amount || 0)

    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      return null
    }

    const invoice =
      invoices.find(
        item =>
          String(item.id) ===
          String(invoiceId)
      )

    if (!invoice) {
      return null
    }

    const outstanding =
      getInvoiceOutstanding(invoice)

    if (paymentAmount > outstanding) {

      alert(
        'Payment cannot be greater than the invoice outstanding amount.'
      )

      return null
    }

    const newPaidAmount =
      Number(
        invoice.paidAmount ||
        invoice.amountPaid ||
        invoice.paid ||
        0
      ) + paymentAmount

    const total =
      getInvoiceTotal(invoice)

    const balanceDue =
      Math.max(
        0,
        total - newPaidAmount
      )

    const payment = {

      id:
        `PAY-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,

      customerId,

      invoiceId,

      amount:
        paymentAmount,

      paymentMethod,

      reference,

      notes,

      date,

      createdAt:
        new Date().toISOString(),
    }

    const payments =
      getStorage(
        'customerPayments',
        []
      )

    const updatedPayments = [
      payment,
      ...payments,
    ]

    localStorage.setItem(
      'customerPayments',
      JSON.stringify(
        updatedPayments
      )
    )

    const updatedInvoice = {

      ...invoice,

      paidAmount:
        newPaidAmount,

      balanceDue,

      paymentStatus:
        balanceDue === 0
          ? 'Paid'
          : 'Partial',

      updatedAt:
        new Date().toISOString(),
    }

    const updatedInvoices =
      invoices.map(item =>
        item.id === invoice.id
          ? updatedInvoice
          : item
      )

    setInvoices(updatedInvoices)

    localStorage.setItem(
      'invoices',
      JSON.stringify(
        updatedInvoices
      )
    )

    if (customerId) {

      updateCustomerOutstanding(
        customerId,
        -paymentAmount
      )
    }

    createNotification({
      type: 'payment',
      title: 'Payment received',
      message:
        `₹${paymentAmount.toLocaleString('en-IN')} payment received.`,
      path: '/customers',
    })

    dispatchUpdate()

    return payment
  }

  // =========================================
  // GET CUSTOMER INVOICES
  // =========================================

  const getCustomerInvoices = (
    customerId
  ) => {

    return invoices.filter(
      invoice =>
        String(invoice.customerId) ===
        String(customerId)
    )
  }

  // =========================================
  // GET CUSTOMER PAYMENTS
  // =========================================

  const getCustomerPayments = (
    customerId
  ) => {

    const payments =
      getStorage(
        'customerPayments',
        []
      )

    return payments.filter(
      payment =>
        String(payment.customerId) ===
        String(customerId)
    )
  }

  // =========================================
  // GET INVOICE PAYMENTS
  // =========================================

  const getInvoicePayments = (
    invoiceId
  ) => {

    const payments =
      getStorage(
        'customerPayments',
        []
      )

    return payments.filter(
      payment =>
        String(payment.invoiceId) ===
        String(invoiceId)
    )
  }

  // =========================================
  // ADD PRODUCT
  // =========================================

  const addProduct = (data) => {

    const newProduct = {

      id: Date.now(),

      name:
        data.name?.trim() || '',

      sku:
        data.sku?.trim() || '',

      hsnSac:
        data.hsnSac?.trim() || '',

      category:
        data.category?.trim() || '',

      unit:
        data.unit || 'pcs',

      purchasePrice:
        Number(data.purchasePrice || 0),

      sellingPrice:
        Number(data.sellingPrice || 0),

      gstRate:
        Number(data.gstRate || 0),

      currentStock:
        Number(data.currentStock || 0),

      reorderPoint:
        Number(data.reorderPoint || 0),

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),
    }

    const updated = [
      newProduct,
      ...products,
    ]

    setProducts(updated)

    localStorage.setItem(
      'products',
      JSON.stringify(updated)
    )

    createNotification({
      type: 'product',
      title: 'Product added',
      message:
        `${newProduct.name} was added to your product catalogue.`,
      path: '/products',
    })

    dispatchUpdate()

    return newProduct
  }

  // =========================================
  // UPDATE PRODUCT
  // =========================================

  const updateProduct = (
    id,
    data
  ) => {

    const oldProduct =
      products.find(
        item => item.id === id
      )

    if (!oldProduct) {
      return null
    }

    const updatedProduct = {

      ...oldProduct,

      ...data,

      name:
        data.name?.trim() ??
        oldProduct.name,

      sku:
        data.sku?.trim() ??
        oldProduct.sku,

      hsnSac:
        data.hsnSac?.trim() ??
        oldProduct.hsnSac,

      category:
        data.category?.trim() ??
        oldProduct.category,

      purchasePrice:
        Number(
          data.purchasePrice ??
          oldProduct.purchasePrice
        ),

      sellingPrice:
        Number(
          data.sellingPrice ??
          oldProduct.sellingPrice
        ),

      gstRate:
        Number(
          data.gstRate ??
          oldProduct.gstRate
        ),

      currentStock:
        Number(
          data.currentStock ??
          oldProduct.currentStock
        ),

      reorderPoint:
        Number(
          data.reorderPoint ??
          oldProduct.reorderPoint
        ),

      updatedAt:
        new Date().toISOString(),
    }

    const updated =
      products.map(item =>
        item.id === id
          ? updatedProduct
          : item
      )

    setProducts(updated)

    localStorage.setItem(
      'products',
      JSON.stringify(updated)
    )

    if (
      updatedProduct.currentStock <=
        updatedProduct.reorderPoint &&
      updatedProduct.reorderPoint > 0
    ) {

      createNotification({
        type: 'low-stock',
        title: 'Low stock alert',
        message:
          `${updatedProduct.name} has only ${updatedProduct.currentStock} ${updatedProduct.unit || 'units'} left.`,
        path: '/products',
      })
    }

    dispatchUpdate()

    return updatedProduct
  }

  // =========================================
  // DELETE PRODUCT
  // =========================================

  const deleteProduct = (id) => {

    const product =
      products.find(
        item => item.id === id
      )

    const updated =
      products.filter(
        item => item.id !== id
      )

    setProducts(updated)

    localStorage.setItem(
      'products',
      JSON.stringify(updated)
    )

    if (product) {

      createNotification({
        type: 'product-delete',
        title: 'Product deleted',
        message:
          `${product.name} was removed from your product catalogue.`,
        path: '/products',
      })
    }

    dispatchUpdate()
  }

  // =========================================
  // ADJUST STOCK
  // =========================================

  const adjustStock = (
    id,
    quantity,
    reason = 'Stock adjustment'
  ) => {

    const amount =
      Number(quantity)

    if (
      !Number.isFinite(amount) ||
      amount === 0
    ) {
      return null
    }

    const product =
      products.find(
        item => item.id === id
      )

    if (!product) {
      return null
    }

    const newStock =
      Math.max(
        0,
        Number(product.currentStock || 0) +
          amount
      )

    const updatedProduct = {

      ...product,

      currentStock:
        newStock,

      updatedAt:
        new Date().toISOString(),
    }

    const updated =
      products.map(item =>
        item.id === id
          ? updatedProduct
          : item
      )

    setProducts(updated)

    localStorage.setItem(
      'products',
      JSON.stringify(updated)
    )

    createNotification({
      type: 'stock',
      title: 'Stock updated',
      message:
        `${product.name}: stock changed by ${amount > 0 ? '+' : ''}${amount}. ${reason}.`,
      path: '/products',
    })

    if (
      newStock <=
        Number(product.reorderPoint || 0) &&
      Number(product.reorderPoint || 0) > 0
    ) {

      createNotification({
        type: 'low-stock',
        title: 'Low stock alert',
        message:
          `${product.name} has only ${newStock} ${product.unit || 'units'} left.`,
        path: '/products',
      })
    }

    dispatchUpdate()

    return updatedProduct
  }

  // =========================================
  // ADD VENDOR
  // =========================================

  const addVendor = (data) => {

    const openingBalance =
      Number(
        data.openingBalance || 0
      )

    const newVendor = {

      id: Date.now(),

      name:
        data.name?.trim() || '',

      gstin:
        data.gstin?.trim() || '',

      phone:
        data.phone?.trim() || '',

      email:
        data.email?.trim() || '',

      address:
        data.address?.trim() || '',

      openingBalance,

      outstanding:
        openingBalance,

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),
    }

    const updated = [
      newVendor,
      ...vendors,
    ]

    setVendors(updated)

    localStorage.setItem(
      'vendors',
      JSON.stringify(updated)
    )

    createNotification({
      type: 'vendor',
      title: 'Vendor added',
      message:
        `${newVendor.name} was added successfully.`,
      path: '/vendors',
    })

    dispatchUpdate()

    return newVendor
  }

  // =========================================
  // UPDATE VENDOR
  // =========================================

  const updateVendor = (
    id,
    data
  ) => {

    const oldVendor =
      vendors.find(
        item => item.id === id
      )

    if (!oldVendor) {
      return null
    }

    const updatedVendor = {

      ...oldVendor,

      ...data,

      name:
        data.name?.trim() ??
        oldVendor.name,

      gstin:
        data.gstin?.trim() ??
        oldVendor.gstin,

      phone:
        data.phone?.trim() ??
        oldVendor.phone,

      email:
        data.email?.trim() ??
        oldVendor.email,

      address:
        data.address?.trim() ??
        oldVendor.address,

      openingBalance:
        Number(
          data.openingBalance ??
          oldVendor.openingBalance
        ),

      outstanding:
        Number(
          data.outstanding ??
          oldVendor.outstanding
        ),

      updatedAt:
        new Date().toISOString(),
    }

    const updated =
      vendors.map(item =>
        item.id === id
          ? updatedVendor
          : item
      )

    setVendors(updated)

    localStorage.setItem(
      'vendors',
      JSON.stringify(updated)
    )

    createNotification({
      type: 'vendor-update',
      title: 'Vendor updated',
      message:
        `${updatedVendor.name} was updated.`,
      path: '/vendors',
    })

    dispatchUpdate()

    return updatedVendor
  }

  // =========================================
  // DELETE VENDOR
  // =========================================

  const deleteVendor = (id) => {

    const vendor =
      vendors.find(
        item => item.id === id
      )

    const updated =
      vendors.filter(
        item => item.id !== id
      )

    setVendors(updated)

    localStorage.setItem(
      'vendors',
      JSON.stringify(updated)
    )

    if (vendor) {

      createNotification({
        type: 'vendor-delete',
        title: 'Vendor deleted',
        message:
          `${vendor.name} was removed.`,
        path: '/vendors',
      })
    }

    dispatchUpdate()
  }

  // =========================================
  // TOTALS
  // =========================================

  const totalIncome =
    incomes.reduce(
      (total, item) =>
        total + Number(item.amount || 0),
      0
    )

  const totalExpense =
    expenses.reduce(
      (total, item) =>
        total + Number(item.amount || 0),
      0
    )

  const balance =
    totalIncome - totalExpense

  const totalProducts =
    products.length

  const totalStockUnits =
    products.reduce(
      (total, product) =>
        total +
        Number(product.currentStock || 0),
      0
    )

  const lowStockProducts =
    products.filter(product =>
      Number(product.reorderPoint || 0) > 0 &&
      Number(product.currentStock || 0) <=
        Number(product.reorderPoint || 0)
    )

  const inventoryPurchaseValue =
    products.reduce(
      (total, product) =>
        total +
        Number(product.currentStock || 0) *
        Number(product.purchasePrice || 0),
      0
    )

  const inventorySellingValue =
    products.reduce(
      (total, product) =>
        total +
        Number(product.currentStock || 0) *
        Number(product.sellingPrice || 0),
      0
    )

  const totalCustomers =
    customers.length

  const customerOutstanding =
    customers.reduce(
      (total, customer) =>
        total +
        Number(customer.outstanding || 0),
      0
    )

  const totalVendors =
    vendors.length

  const vendorOutstanding =
    vendors.reduce(
      (total, vendor) =>
        total +
        Number(vendor.outstanding || 0),
      0
    )

  // =========================================
  // PROVIDER
  // =========================================

  return (
    <FinanceContext.Provider
      value={{

        incomes,
        expenses,
        invoices,

        setIncomes,
        setExpenses,
        setInvoices,

        addIncome,
        deleteIncome,

        addExpense,
        deleteExpense,

        addInvoice,
        updateInvoice,
        deleteInvoice,

        getInvoiceTotal,
        getInvoiceOutstanding,

        totalIncome,
        totalExpense,
        balance,

        products,

        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,

        totalProducts,
        totalStockUnits,
        lowStockProducts,

        inventoryPurchaseValue,
        inventorySellingValue,

        customers,

        addCustomer,
        updateCustomer,
        deleteCustomer,

        updateCustomerOutstanding,

        getCustomerInvoices,
        getCustomerPayments,
        getInvoicePayments,

        recordCustomerPayment,

        totalCustomers,
        customerOutstanding,

        vendors,

        addVendor,
        updateVendor,
        deleteVendor,

        totalVendors,
        vendorOutstanding,

        notifications,

        createNotification,

        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

// =========================================
// USE FINANCE
// =========================================

export function useFinance() {

  return useContext(
    FinanceContext
  )
}