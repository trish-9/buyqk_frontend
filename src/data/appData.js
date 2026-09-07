export const defaultSearchData = {
  customers: [
    {
      id: 1,
      name: "Rahul Kumar",
      email: "rahul@gmail.com",
      phone: "9876543210",
      type: "Customer",
      path: "/customers/1",
    },
    {
      id: 2,
      name: "Amit Sharma",
      email: "amit@gmail.com",
      phone: "9876543211",
      type: "Customer",
      path: "/customers/2",
    },
  ],

  products: [
    {
      id: 1,
      name: "Dell Laptop",
      sku: "DELL-001",
      category: "Electronics",
      type: "Product",
      path: "/products",
    },
    {
      id: 2,
      name: "Wireless Mouse",
      sku: "MOUSE-001",
      category: "Accessories",
      type: "Product",
      path: "/products",
    },
  ],

  invoices: [
    {
      id: 1,
      invoiceNumber: "INV-001",
      customerName: "Rahul Kumar",
      amount: 25000,
      type: "Invoice",
      path: "/invoices",
    },
    {
      id: 2,
      invoiceNumber: "INV-002",
      customerName: "Amit Sharma",
      amount: 18500,
      type: "Invoice",
      path: "/invoices",
    },
  ],
}