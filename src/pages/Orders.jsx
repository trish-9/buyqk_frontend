import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  Printer,
  ShoppingCart,
  CalendarDays,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { useFinance } from "../context/FinanceContext";

const API_BASE = "http://localhost:5000/api";

export default function Orders() {
  // =========================
  // AUTH / USER
  // =========================
  const em = localStorage.getItem("userEmail");
  const token = localStorage.getItem("token");

  // =========================
  // FINANCE CONTEXT (only for invoice functions)
  // =========================
  const { invoices = [], addInvoice } = useFinance();

  // =========================
  // PRODUCTS STATES (from backend)
  // =========================
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // =========================
  // CUSTOMER STATES
  // =========================
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  // =========================
  // ORDERS STATES (from backend)
  // =========================
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // =========================
  // EMPTY FORM
  // =========================
  const getEmptyForm = () => ({
    customerId: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    orderDate: new Date().toISOString().split("T")[0],
    status: "Pending",
    notes: "",
    items: [
      {
        productId: "",
        productName: "",
        quantity: 1,
        price: 0,
        gstRate: 0,
      },
    ],
  });

  const [form, setForm] = useState(getEmptyForm());

  // =========================
  // FETCH PRODUCTS (from backend)
  // =========================
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await fetch(`${API_BASE}/product/add/get`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization" : `${token}`,
        },
        body: JSON.stringify({ em: em }),
      });

      if (response.status !== 200) {
        throw new Error(`Failed to fetch products. Status: ${response.status}`);
      }

      const result = await response.json();

      let productList = [];
      if (Array.isArray(result)) {
        productList = result;
      } else if (Array.isArray(result.products)) {
        productList = result.products;
      } else if (Array.isArray(result.data)) {
        productList = result.data;
      }

      const formattedProducts = productList.map((product) => ({
        id: product.id || product._id,
        name: product.product_name || product.name || "",
        productName: product.product_name || product.name || "",
        sku: product.sku || product.SKU || "",
        hsnSac: product.hsn || product.HSN || product.hsnSac || "",
        category: product.categ || product.category || "",
        unit: product.unit || product.Unit || "Piece",
        purchasePrice: Number(product.purc_price || product.purchasePrice || 0),
        sellingPrice: Number(product.seeling_price || product.sellingPrice || 0),
        price: Number(product.seeling_price || product.sellingPrice || 0),
        gstRate: Number(product.gstin || product.gstRate || 0),
        gst: Number(product.gstin || product.gstRate || 0),
        currentStock: Number(product.cur_s || product.currentStock || 0),
        stock: Number(product.cur_s || product.currentStock || 0),
        reorderPoint: Number(product.reo_point || product.reorderPoint || 0),
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error("Product fetch error:", error);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // =========================
  // FETCH CUSTOMERS
  // =========================
  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);
      const response = await fetch(`${API_BASE}/add/get`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization" : `${token}`,
        },
        body: JSON.stringify({ em: em }),
      });

      if (response.status !== 200) {
        throw new Error(`Failed to fetch customers. Status: ${response.status}`);
      }

      const data = await response.json();

      let customerList = [];
      if (Array.isArray(data)) {
        customerList = data;
      } else if (Array.isArray(data.customers)) {
        customerList = data.customers;
      } else if (Array.isArray(data.data)) {
        customerList = data.data;
      }

      const formattedCustomers = customerList.map((customer, index) => ({
        ...customer,
        id: customer.id || String(index + 1),
        name: customer.name || "Unknown Customer",
        email: customer.uemail || customer.email || "",
        phone: customer.phone || "",
        address: customer.add || customer.address || "",
      }));

      setCustomers(formattedCustomers);
    } catch (error) {
      console.error("Customer fetch error:", error);
      toast.error("Failed to load customers");
      setCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  };

  // =========================
  // FETCH ORDERS
  //
  // Confirmed from the backend:
  //
  //   app.post("/api/order/get", async (req, res) => {
  //     const { em, id } = req.body;
  //     const i = await con.query("select * from orders1 where email = $1;", [em]);
  //     const r = await con.query("select * from items1 where email = $1;", [em]);
  //     res.json({ order: i.rows || null, items: r.rows });
  //   });
  //
  // "id" is accepted but never used in the query, and "order" is really
  // EVERY order row for this email (not a single order despite the
  // singular-sounding key). "items" is a FLAT array covering every
  // order's line items combined — each row carries its parent order's
  // id. So a single call returns everything; group items by id to
  // attach the right items to the right order (same pattern as
  // Purchases' fetchPurchases()). No id-by-id looping is needed.
  // =========================
  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/order/get`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization" : `${token}`,
        },
        body: JSON.stringify({ em: em }),
      });

      if (response.status !== 200) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const result = await response.json();

      const orderRows = Array.isArray(result.order) ? result.order : [];
      const itemRows = Array.isArray(result.items) ? result.items : [];

      const itemsByOrderId = {};
      itemRows.forEach((item) => {
        const key = String(item.id);
        if (!itemsByOrderId[key]) {
          itemsByOrderId[key] = [];
        }
        itemsByOrderId[key].push(item);
      });

      const collected = orderRows.map((order) => {
        const rawItems = itemsByOrderId[String(order.id)] || [];

        const formattedItems = rawItems.map((item, index) => ({
          id: item.p_id ? `${item.p_id}-${index}` : String(index),
          productId: item.p_id || "",
          productName: item.p_name || "",
          quantity: Number(item.quan || 0),
          price: Number(item.price || 0),
          gstRate: Number(item.gst || 0),
        }));

        const computedTotal = formattedItems.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0
        );

        return {
          id: order.id,
          orderNumber: `ORD-${String(order.id).padStart(4, "0")}`,
          customerId: order.cusid || "",
          customerName: order.cusname || "Unknown Customer",
          // orders1 has no customer-email column at all — the "email"
          // column on this row is the merchant account's own email
          // (used for filtering), not the customer's, so it is not
          // used here.
          customerEmail: "",
          customerPhone: order.cus_phone || "",
          orderDate: order.odedate || new Date().toISOString().split("T")[0],
          status: order.status || "Pending",
          notes: order.notes || "",
          items: formattedItems,
          total:
            order.total !== undefined && order.total !== null && order.total !== ""
              ? Number(order.total)
              : computedTotal,
        };
      });

      setOrders(collected);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    fetchOrders();
  }, []);

  // =========================
  // FORMAT CURRENCY
  // =========================
  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =========================
  // ITEM TOTAL
  // =========================
  const getItemTotal = (item) => {
    return Number(item.quantity || 0) * Number(item.price || 0);
  };

  // =========================
  // ORDER TOTAL
  // =========================
  const getOrderTotal = (items) => {
    return items.reduce((total, item) => {
      return total + getItemTotal(item);
    }, 0);
  };

  // =========================
  // OPEN ADD MODAL
  // =========================
  const openAddModal = () => {
    setEditingOrder(null);
    setForm(getEmptyForm());
    fetchProducts();
    fetchCustomers();
    setShowModal(true);
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================
  const openEditModal = (order) => {
    setEditingOrder(order);
    setForm({
      customerId: order.customerId || "",
      customerName: order.customerName || "",
      customerEmail: order.customerEmail || "",
      customerPhone: order.customerPhone || "",
      orderDate: order.orderDate || new Date().toISOString().split("T")[0],
      status: order.status || "Pending",
      notes: order.notes || "",
      items: order.items && order.items.length > 0 ? order.items : getEmptyForm().items,
    });
    fetchProducts();
    fetchCustomers();
    setShowModal(true);
  };

  // =========================
  // CUSTOMER CHANGE
  // =========================
  const handleCustomerChange = (customerId) => {
    const customer = customers.find((item) => String(item.id) === String(customerId));
    if (!customer) return;

    setForm((previous) => ({
      ...previous,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email || "",
      customerPhone: customer.phone || "",
    }));
  };

  // =========================
  // PRODUCT CHANGE
  // =========================
  const handleProductChange = (index, productId) => {
    const product = products.find((item) => String(item.id) === String(productId));

    const updatedItems = [...form.items];
    updatedItems[index] = {
      ...updatedItems[index],
      productId: productId,
      productName: product?.name || product?.productName || "",
      price: Number(product?.sellingPrice || product?.price || 0),
      gstRate: Number(product?.gstRate || product?.gst || 0),
    };

    setForm((previous) => ({
      ...previous,
      items: updatedItems,
    }));
  };

  // =========================
  // UPDATE ITEM
  // =========================
  const updateItem = (index, field, value) => {
    const updatedItems = [...form.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === "quantity" || field === "price" || field === "gstRate" ? Number(value) : value,
    };
    setForm((previous) => ({
      ...previous,
      items: updatedItems,
    }));
  };

  // =========================
  // ADD ITEM
  // =========================
  const addItem = () => {
    setForm((previous) => ({
      ...previous,
      items: [
        ...previous.items,
        {
          productId: "",
          productName: "",
          quantity: 1,
          price: 0,
          gstRate: 0,
        },
      ],
    }));
  };

  // =========================
  // REMOVE ITEM
  // =========================
  const removeItem = (index) => {
    if (form.items.length === 1) {
      toast.error("At least one item is required");
      return;
    }
    setForm((previous) => ({
      ...previous,
      items: previous.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  // =========================
  // SAVE ORDER (Create/Update)
  //
  // Confirmed backend field names:
  //
  //   /api/order/add reads:    form.customerId (lowercase c), form.Phone,
  //                             form.orderDate, form.status, form.notes,
  //                             form.total, form.items[].productID/
  //                             productName/quantity/price/gstRate
  //
  //   /api/order/update reads: form.CustomerId (CAPITAL C — a mismatch
  //                             with /add that exists in the backend
  //                             itself), form.customerName, form.Phone,
  //                             form.orderDate, form.status, form.notes,
  //                             form.total, and the same item shape as
  //                             /add. Body is { id, em, form }.
  //
  // Matched exactly below since the backend is not being touched.
  //
  // NOTE: /api/order/update only reliably updates line items when the
  // number of items sent equals the number already stored for that
  // order — the backend uses a module-level counter that is never
  // reset between requests, so this comparison can misbehave across
  // multiple saves in the same server run. That's a backend-side issue
  // and can't be fixed from here without touching the backend.
  // =========================
  const handleSaveOrder = async (event) => {
    event.preventDefault();

    if (!form.customerId) {
      toast.error("Please select a customer");
      return;
    }

    const validItems = form.items.filter(
      (item) => item.productId && item.productName && Number(item.quantity) > 0
    );

    if (validItems.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    const total = getOrderTotal(validItems);

    const itemsPayload = validItems.map((item) => ({
      productID: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      gstRate: item.gstRate,
    }));

    setSubmitting(true);

    try {
      let response;

      if (editingOrder) {
        const orderData = {
          CustomerId: form.customerId,
          customerName: form.customerName,
          Phone: form.customerPhone,
          orderDate: form.orderDate,
          status: form.status,
          notes: form.notes,
          total: total,
          items: itemsPayload,
        };

        response = await fetch(`${API_BASE}/order/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization" : `${token}`,
          },
          body: JSON.stringify({
            id: editingOrder.id,
            em: em,
            form: orderData,
          }),
        });
      } else {
        const orderData = {
          customerId: form.customerId,
          customerName: form.customerName,
          Phone: form.customerPhone,
          orderDate: form.orderDate,
          status: form.status,
          notes: form.notes,
          total: total,
          items: itemsPayload,
        };

        response = await fetch(`${API_BASE}/order/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization" : `${token}`,
          },
          body: JSON.stringify({
            em: em,
            form: orderData,
          }),
        });
      }

      if (response.status !== 200) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      await fetchOrders();
      toast.success(editingOrder ? "Order updated successfully" : "Order created successfully");

      setShowModal(false);
      setEditingOrder(null);
      setForm(getEmptyForm());
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while saving order.");
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // DELETE ORDER
  //
  // Confirmed route: POST /api/order/delete, body { id, em } — deletes
  // the order row from orders1 and its line items from items1.
  // =========================
  const deleteOrder = async (order) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${order.orderNumber}?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_BASE}/order/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization" : `${token}`,
        },
        body: JSON.stringify({
          id: order.id,
          em: em,
        }),
      });

      if (response.status !== 200) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      await fetchOrders();
      toast.success("Order deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete order.");
    }
  };

  // =========================
  // FILTER ORDERS
  // =========================
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchText = search.toLowerCase().trim();
      const searchMatch =
        !searchText ||
        String(order.orderNumber || "").toLowerCase().includes(searchText) ||
        String(order.customerName || "").toLowerCase().includes(searchText);

      const statusMatch = statusFilter === "All" || order.status === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [orders, search, statusFilter]);

  // =========================
  // STATS
  // =========================
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order) => order.status === "Pending").length;
  const completedOrders = orders.filter((order) => order.status === "Completed").length;
  const totalSales = orders
    .filter((order) => order.status !== "Cancelled")
    .reduce((total, order) => total + Number(order.total || 0), 0);

  // =========================
  // STATUS STYLE
  // =========================
  const getStatusStyle = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Processing":
        return "bg-blue-100 text-blue-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  // =========================
  // PRINT ORDER
  // =========================
  const printOrder = (order) => {
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;

    const itemsHTML = order.items
      .map(
        (item) => `
          <tr>
            <td>${item.productName}</td>
            <td>${item.quantity}</td>
            <td>₹${Number(item.price).toFixed(2)}</td>
            <td>₹${getItemTotal(item).toFixed(2)}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background: #f3f4f6; }
            .total { margin-top: 20px; text-align: right; font-size: 22px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Order ${order.orderNumber}</h1>
          <p><strong>Customer:</strong> ${order.customerName}</p>
          <p><strong>Email:</strong> ${order.customerEmail || "-"}</p>
          <p><strong>Phone:</strong> ${order.customerPhone || "-"}</p>
          <p><strong>Date:</strong> ${order.orderDate}</p>
          <table>
            <thead>
              <tr><th>Product</th><th>Quantity</th><th>Price</th><th>Total</th></tr>
            </thead>
            <tbody>${itemsHTML}</tbody>
          </table>
          <div class="total">Grand Total: ₹${Number(order.total).toFixed(2)}</div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // =========================
  // CREATE INVOICE
  // =========================
  const createInvoiceFromOrder = (order) => {
    if (!addInvoice) {
      toast.error("Invoice system is not available");
      return;
    }

    const alreadyExists = invoices.some((invoice) => String(invoice.orderId) === String(order.id));
    if (alreadyExists) {
      toast.error("Invoice already created");
      return;
    }

    const invoiceData = {
      id: Date.now().toString(),
      invoiceNumber: `INV-${Date.now()}`,
      customer: order.customerName,
      customerId: order.customerId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      invoiceDate: order.orderDate,
      amount: order.total,
      grandTotal: order.total,
      status: "Pending",
      items: order.items,
    };

    addInvoice(invoiceData);
    toast.success("Invoice created successfully");
  };

  // =========================
  // RETURN UI
  // =========================
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 mt-1">Create and manage customer orders</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl"
        >
          <Plus size={18} />
          New Order
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border rounded-2xl p-5">
          <p className="text-sm text-slate-500">Total Orders</p>
          <p className="text-2xl font-bold mt-2">{totalOrders}</p>
        </div>
        <div className="bg-white border rounded-2xl p-5">
          <p className="text-sm text-slate-500">Pending Orders</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{pendingOrders}</p>
        </div>
        <div className="bg-white border rounded-2xl p-5">
          <p className="text-sm text-slate-500">Completed Orders</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{completedOrders}</p>
        </div>
        <div className="bg-white border rounded-2xl p-5">
          <p className="text-sm text-slate-500">Total Sales</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(totalSales)}</p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white border rounded-2xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search order or customer..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full border rounded-xl pl-10 pr-4 py-3 outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="border rounded-xl px-4 py-3"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <p className="text-slate-500">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart size={50} className="mx-auto text-slate-300" />
            <h3 className="font-bold text-lg mt-4">No Orders Found</h3>
            <button onClick={openAddModal} className="mt-4 bg-blue-600 text-white px-5 py-3 rounded-xl">
              Create Your First Order
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-4">Order</th>
                  <th className="text-left p-4">Customer</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-right p-4">Total</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t hover:bg-slate-50">
                    <td className="p-4 font-bold">{order.orderNumber}</td>
                    <td className="p-4">{order.customerName}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={15} />
                        {order.orderDate}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold">{formatCurrency(order.total)}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetails(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye size={18} />
                        </button>
                        <button onClick={() => openEditModal(order)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => printOrder(order)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg">
                          <Printer size={18} />
                        </button>
                        <button onClick={() => deleteOrder(order)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{editingOrder ? "Edit Order" : "Create New Order"}</h2>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="p-6 space-y-6">
              {/* CUSTOMER */}
              <div>
                <label className="block font-medium mb-2">Select Customer *</label>
                <select
                  value={form.customerId}
                  onChange={(event) => handleCustomerChange(event.target.value)}
                  className="w-full border rounded-xl px-4 py-3"
                >
                  <option value="">
                    {customersLoading ? "Loading customers..." : "Select Customer"}
                  </option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                      {customer.phone ? ` - ${customer.phone}` : ""}
                    </option>
                  ))}
                </select>
                {form.customerId && (
                  <div className="mt-3 p-4 bg-blue-50 rounded-xl">
                    <p className="font-bold">{form.customerName}</p>
                    <p className="text-sm">Email: {form.customerEmail || "-"}</p>
                    <p className="text-sm">Phone: {form.customerPhone || "-"}</p>
                  </div>
                )}
              </div>

              {/* DATE AND STATUS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-medium mb-2">Order Date</label>
                  <input
                    type="date"
                    value={form.orderDate}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        orderDate: event.target.value,
                      }))
                    }
                    className="w-full border rounded-xl px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Status</label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        status: event.target.value,
                      }))
                    }
                    className="w-full border rounded-xl px-4 py-3"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* PRODUCTS */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold">Order Items</h3>
                  </div>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl"
                  >
                    <Plus size={17} />
                    Add Product
                  </button>
                </div>
                <div className="space-y-4">
                  {form.items.map((item, index) => (
                    <div key={index} className="border rounded-2xl p-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2">Product</label>
                          <select
                            value={item.productId}
                            onChange={(event) => handleProductChange(index, event.target.value)}
                            className="w-full border rounded-xl px-3 py-3"
                          >
                            <option value="">
                              {productsLoading ? "Loading products..." : "Select Product"}
                            </option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name || product.productName}
                                {" | Stock: "}
                                {product.currentStock || product.stock || 0}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(event) => updateItem(index, "quantity", event.target.value)}
                            className="w-full border rounded-xl px-3 py-3"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Price</label>
                          <input
                            type="number"
                            min="0"
                            value={item.price}
                            onChange={(event) => updateItem(index, "price", event.target.value)}
                            className="w-full border rounded-xl px-3 py-3"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="border border-red-200 text-red-600 px-3 py-3 rounded-xl"
                        >
                          <Trash2 size={18} className="mx-auto" />
                        </button>
                      </div>
                      <div className="flex justify-between mt-4">
                        <span className="text-slate-500">GST: {item.gstRate}%</span>
                        <span className="font-bold">Item Total: {formatCurrency(getItemTotal(item))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* NOTES */}
              <div>
                <label className="block font-medium mb-2">Notes</label>
                <textarea
                  rows="4"
                  value={form.notes}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Add notes..."
                  className="w-full border rounded-xl px-4 py-3"
                />
              </div>

              {/* TOTAL */}
              <div className="bg-slate-50 border rounded-2xl p-5 flex justify-between">
                <span className="text-lg font-bold">Order Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(getOrderTotal(form.items))}
                </span>
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 border-t pt-5">
                <button type="button" onClick={() => setShowModal(false)} className="border px-5 py-3 rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl disabled:opacity-60">
                  {submitting ? "Saving..." : editingOrder ? "Update Order" : "Create Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Order Details</h2>
                <p className="text-slate-500">{selectedOrder.orderNumber}</p>
              </div>
              <button onClick={() => setShowDetails(false)} className="p-2">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* CUSTOMER */}
              <div className="border rounded-2xl p-5">
                <h3 className="font-bold mb-3">Customer Details</h3>
                <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                <p><strong>Email:</strong> {selectedOrder.customerEmail || "-"}</p>
                <p><strong>Phone:</strong> {selectedOrder.customerPhone || "-"}</p>
              </div>

              {/* ITEMS */}
              <div>
                <h3 className="font-bold mb-4">Order Items</h3>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-3">Product</th>
                        <th className="text-center p-3">Qty</th>
                        <th className="text-right p-3">Price</th>
                        <th className="text-right p-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">{item.productName}</td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-right">{formatCurrency(item.price)}</td>
                          <td className="p-3 text-right font-bold">{formatCurrency(getItemTotal(item))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TOTAL */}
              <div className="bg-blue-50 p-5 rounded-2xl flex justify-between">
                <span className="font-bold text-lg">Grand Total</span>
                <span className="font-bold text-xl text-blue-600">{formatCurrency(selectedOrder.total)}</span>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-wrap gap-3 border-t pt-5">
                <button onClick={() => printOrder(selectedOrder)} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-xl">
                  <Printer size={18} />
                  Print Order
                </button>
                <button onClick={() => createInvoiceFromOrder(selectedOrder)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-xl">
                  <FileText size={18} />
                  Create Invoice
                </button>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    openEditModal(selectedOrder);
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl"
                >
                  <Pencil size={18} />
                  Edit Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}