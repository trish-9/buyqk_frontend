import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  X,
  ReceiptText,
  Calendar,
  CheckCircle2,
  Clock3,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = "https://buyqk-bakend.onrender.com/api";

/* =========================================================
   NOTE ON BACKEND ROUTES (re-confirmed against the actual
   server code — not just the earlier comment, which had a
   couple of details wrong)
   ---------------------------------------------------------

   POST /api/purchase/get  { em }
     -> { item: [...], purchase: [...] }
     "purchase" = one row per purchase (id, pur_num, date, ven_id,
     ven_name, ven_phone, sub_total, total_tax, total, paid,
     due_amount, status). "item" = a FLAT array of every purchase's
     line items combined, each row carrying its parent purchase's id.
     fetchPurchases() groups these by id.

   POST /api/purchase/add  { em, form }
     Reads: form.purchaseNumber, form.date, form.vendorId,
     form.vendorName, form.vendorPhone, form.subtotal, form.totalTax,
     form.total, form.paid, form.dueAmount, form.status, and each
     item's productID, productName, quantity, rate, discount, gstRate.

   POST /api/purchase/update  { id, em, form }
     Reads DIFFERENT field names than /add: form.pur_num, form.date,
     form.ven_id, form.ven_name, form.ven_phone, form.sub_total,
     form.total_tax, form.total, form.paid, form.due_amount,
     form.status, and each item's p_id, p_name, quan, rate, discount,
     gstrate.
     KNOWN BACKEND BUG (not fixed here — backend not touched): this
     route uses a module-level counter that is never reset between
     requests to decide whether to insert or update line items. In
     practice this means the "insert new rows" branch runs almost
     every time, and that branch contains
     `for (const i = l.rowCount; i < p; i++)` — reassigning a `const`
     with `i++`, which throws a TypeError and crashes the request.
     If that branch is somehow skipped, the fallback path never calls
     res.sendStatus(), so the request just hangs. In its current
     state this route will generally fail (crash or hang) regardless
     of what the frontend sends.

   POST /api/purchase/delete  { id, em }
     Deletes the whole purchase (pur + pur_items rows for that id).

   POST /api/purchase/i/delete  { em, id }
     KNOWN BACKEND BUG: only filters by email + purchase id — it does
     NOT filter by p_id at all, so it deletes EVERY line item on that
     purchase, not just one. The confirm dialog below reflects this
     real behavior so nobody loses data by accident.
========================================================= */

export default function Purchases() {
  // =====================================================
  // AUTH / USER
  // =====================================================

  const em = localStorage.getItem("userEmail");
  const token = localStorage.getItem("token");
  console.log(token)
  // =====================================================
  // VENDORS (from backend)
  // =====================================================

  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);

  const fetchVendors = async () => {
    setVendorsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/ven/get`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization" : `${token}`,
        },
        body: JSON.stringify({ em: em }),
      });

      if (response.status !== 200) {
        throw new Error(`Failed to fetch vendors. Status: ${response.status}`);
      }

      const result = await response.json();

      const rows = Array.isArray(result)
        ? result
        : result?.vendors || result?.data || [];

      const normalized = rows.map((item) => ({
        id: item.id ?? item.vendor_id,

        name:
          item.name ??
          item.vendor_name ??
          item.v_name ??
          "",

        companyName:
          item.companyName ??
          item.com_name ??
          item.company ??
          "",

        phone:
          item.phone ??
          item.mobile ??
          item.vendor_phone ??
          "",

        email: item.c_email ?? item.vendor_email ?? "",

        gstin: item.gstin ?? item.gst ?? item.gst_number ?? "",
      }));

      setVendors(normalized);
    } catch (error) {
      console.error("Vendor fetch error:", error);
      toast.error("Failed to load vendors");
      setVendors([]);
    } finally {
      setVendorsLoading(false);
    }
  };

  // =====================================================
  // PRODUCTS (from backend)
  // =====================================================

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const fetchProducts = async () => {
    setProductsLoading(true);

    try {
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

      const formatted = productList.map((product) => ({
        id: product.id || product._id,
        name: product.product_name || product.name || "",
        sku: product.sku || product.SKU || "",
        purchasePrice: Number(
          product.purc_price || product.purchasePrice || 0
        ),
        sellingPrice: Number(
          product.seeling_price || product.sellingPrice || 0
        ),
        gstRate: Number(product.gstin || product.gstRate || 0),
        currentStock: Number(product.cur_s || product.currentStock || 0),
      }));

      setProducts(formatted);
    } catch (error) {
      console.error("Product fetch error:", error);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // =====================================================
  // PURCHASES (from backend)
  // =====================================================

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPurchases = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/purchase/get`, {
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

      // Backend returns { item: [...], purchase: [...] } — "item" is a
      // FLAT array covering every purchase's line items in one list, each
      // row carrying the parent purchase's id (pur.id). Group them by
      // that id to attach the right items to the right purchase.
      const purchaseRows = Array.isArray(result.purchase)
        ? result.purchase
        : [];
      const itemRows = Array.isArray(result.item) ? result.item : [];

      const itemsByPurchaseId = {};
      itemRows.forEach((item) => {
        const key = String(item.id);
        if (!itemsByPurchaseId[key]) {
          itemsByPurchaseId[key] = [];
        }
        itemsByPurchaseId[key].push(item);
      });

      const normalized = purchaseRows.map((purchase) => {
        const rawItems = itemsByPurchaseId[String(purchase.id)] || [];

        const formattedItems = rawItems.map((item, index) => ({
          id: `${item.p_id}-${index}`,
          productId: item.p_id || "",
          productName: item.p_name || "",
          quantity: Number(item.quan || 0),
          rate: Number(item.rate || 0),
          discount: Number(item.discount || 0),
          gstRate: Number(item.gstrate || 0),
        }));

        return {
          id: purchase.id,
          purchaseNumber: purchase.pur_num || `PUR-${purchase.id}`,
          vendorId: purchase.ven_id || "",
          vendorName: purchase.ven_name || "Unknown Vendor",
          vendorPhone: purchase.ven_phone || "",
          date: purchase.date || new Date().toISOString().slice(0, 10),
          items: formattedItems,
          subtotal: Number(purchase.sub_total || 0),
          totalTax: Number(purchase.total_tax || 0),
          grandTotal: Number(purchase.total || 0),
          paidAmount: Number(purchase.paid || 0),
          dueAmount: Number(purchase.due_amount || 0),
          paymentStatus: purchase.status || "unpaid",
        };
      });

      setPurchases(normalized);
    } catch (err) {
      console.error("Purchase fetch error:", err);
      setError("Failed to load purchases.");
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    fetchVendors();
    fetchProducts();
    fetchPurchases();
  }, []);

  // =====================================================
  // UI STATE
  // =====================================================

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editingPurchase, setEditingPurchase] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredPurchases = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return purchases.filter((purchase) => {
      const matchesSearch =
        !searchText ||
        [purchase.purchaseNumber, purchase.vendorName, purchase.vendorPhone]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchText));

      const matchesStatus =
        statusFilter === "all" || purchase.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [purchases, search, statusFilter]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalPurchaseAmount = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.grandTotal || 0),
    0
  );

  const totalPaid = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.paidAmount || 0),
    0
  );

  const totalDue = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.dueAmount || 0),
    0
  );

  // =====================================================
  // SAVE PURCHASE (Create/Update)
  //
  // PurchaseForm hands back a NEUTRAL shape (camelCase, not tied to
  // either route). That's turned into the exact shape each backend
  // route actually reads, since /api/purchase/add and
  // /api/purchase/update expect DIFFERENT field names for the same
  // data (confirmed from the backend code — see the note at the top
  // of this file). Sending the same object to both routes, like the
  // previous version of this file did, meant new purchases were
  // saved with most fields undefined.
  // =====================================================

  const handleSavePurchase = async (purchaseData) => {
    setSubmitting(true);

    try {
      let response;

      if (editingPurchase) {
        // /api/purchase/update reads: pur_num, date, ven_id, ven_name,
        // ven_phone, sub_total, total_tax, total, paid, due_amount,
        // status, and each item's p_id, p_name, quan, rate, discount,
        // gstrate.
        const form = {
          pur_num: purchaseData.purchaseNumber,
          date: purchaseData.date,
          ven_id: purchaseData.vendorId,
          ven_name: purchaseData.vendorName,
          ven_phone: purchaseData.vendorPhone,
          sub_total: purchaseData.subtotal,
          total_tax: purchaseData.totalTax,
          total: purchaseData.total,
          paid: purchaseData.paid,
          due_amount: purchaseData.dueAmount,
          status: purchaseData.status,
          items: purchaseData.items.map((item) => ({
            p_id: item.productId,
            p_name: item.productName,
            quan: item.quantity,
            rate: item.rate,
            discount: item.discount,
            gstrate: item.gstRate,
          })),
        };

        response = await fetch(`${API_BASE}/purchase/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization" : `${token}`,
          },
          body: JSON.stringify({ id: editingPurchase.id, em: em, form: form }),
        });
      } else {
        // /api/purchase/add reads: purchaseNumber, date, vendorId,
        // vendorName, vendorPhone, subtotal, totalTax, total, paid,
        // dueAmount, status, and each item's productID, productName,
        // quantity, rate, discount, gstRate.
        const form = {
          purchaseNumber: purchaseData.purchaseNumber,
          date: purchaseData.date,
          vendorId: purchaseData.vendorId,
          vendorName: purchaseData.vendorName,
          vendorPhone: purchaseData.vendorPhone,
          subtotal: purchaseData.subtotal,
          totalTax: purchaseData.totalTax,
          total: purchaseData.total,
          paid: purchaseData.paid,
          dueAmount: purchaseData.dueAmount,
          status: purchaseData.status,
          items: purchaseData.items.map((item) => ({
            productID: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            rate: item.rate,
            discount: item.discount,
            gstRate: item.gstRate,
          })),
        };

        response = await fetch(`${API_BASE}/purchase/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization" : `${token}`,
          },
          body: JSON.stringify({ em: em, form: form }),
        });
      }

      if (response.status !== 200) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      await fetchPurchases();
      toast.success(
        editingPurchase
          ? "Purchase updated successfully"
          : "Purchase created successfully"
      );

      setShowForm(false);
      setEditingPurchase(null);
    } catch (err) {
      console.error("Save purchase error:", err);
      toast.error("Something went wrong while saving purchase.");
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // DELETE PURCHASE (whole purchase — confirmed route)
  // =====================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this purchase?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch("https://buyqk-bakend.onrender.com/api/purchase/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization" : `${token}`,
        },
        body: JSON.stringify({ id: id, em: em }),
      });

      if (response.status !== 200) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      await fetchPurchases();
      toast.success("Purchase deleted successfully");
    } catch (err) {
      console.error("Delete purchase error:", err);
      toast.error("Failed to delete purchase.");
    }
  };

  // =====================================================
  // DELETE ITEM(S) FROM A PURCHASE
  //
  // Backend route /api/purchase/i/delete only filters by { em, id }
  // (the purchase id) — it does NOT filter by p_id, so it deletes
  // EVERY line item on that purchase, not just the one clicked. The
  // confirm text below says so plainly instead of implying a single
  // item will be removed.
  // =====================================================

  const handleDeleteItem = async (purchaseId, p_id) => {
    const confirmed = window.confirm(
      "This will remove ALL items from this purchase, not just this one " +
        "(that's how the backend route currently works). Continue?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch("https://buyqk-bakend.onrender.com/api/purchase/i/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization" : `${token}`,
        },
        body: JSON.stringify({ id: purchaseId, p_id: p_id, em: em }),
      });

      if (response.status !== 200) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      await fetchPurchases();
      toast.success("Item(s) removed successfully");
    } catch (err) {
      console.error("Delete item error:", err);
      toast.error("Failed to remove item.");
    }
  };

  // =====================================================
  // OPEN MODALS
  // =====================================================

  const openAddModal = () => {
    setEditingPurchase(null);
    fetchVendors();
    fetchProducts();
    setShowForm(true);
  };

  const openEditModal = (purchase) => {
    setEditingPurchase(purchase);
    fetchVendors();
    fetchProducts();
    setShowForm(true);
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchases</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage purchase bills and supplier purchases.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
        >
          <Plus size={18} />
          Add Purchase
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Total Purchases"
          value={totalPurchaseAmount}
          icon={ReceiptText}
        />
        <SummaryCard title="Total Paid" value={totalPaid} icon={CheckCircle2} />
        <SummaryCard title="Outstanding" value={totalDue} icon={Clock3} />
      </div>

      {/* SEARCH + FILTER */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search purchase number or vendor..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-orange-400"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            Loading purchases...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    ID
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    Purchase
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    Vendor
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    Date
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-400">
                    Total
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-400">
                    Due
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    Status
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-14 text-center">
                      <ReceiptText
                        size={42}
                        className="mx-auto mb-3 text-slate-300"
                      />
                      <p className="font-semibold text-slate-600">
                        No purchases found
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Add your first purchase.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <tr
                      key={purchase.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-slate-500">
                        {purchase.id ?? "—"}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {purchase.purchaseNumber}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {purchase.items?.length || 0} items
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700">
                          {purchase.vendorName}
                        </p>
                        {purchase.vendorPhone && (
                          <p className="mt-1 text-xs text-slate-400">
                            {purchase.vendorPhone}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar size={15} />
                          {formatDate(purchase.date)}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right font-semibold text-slate-800">
                        ₹{formatMoney(purchase.grandTotal)}
                      </td>

                      <td className="px-5 py-4 text-right font-semibold text-red-500">
                        ₹{formatMoney(purchase.dueAmount)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={purchase.paymentStatus} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            title="View"
                            onClick={() => setSelectedPurchase(purchase)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            title="Edit"
                            onClick={() => openEditModal(purchase)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-orange-50 hover:text-orange-500"
                          >
                            <Edit3 size={17} />
                          </button>

                          <button
                            type="button"
                            title="Delete"
                            onClick={() => handleDelete(purchase.id)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PURCHASE FORM */}
      {showForm && (
        <PurchaseForm
          purchase={editingPurchase}
          vendors={vendors}
          vendorsLoading={vendorsLoading}
          products={products}
          productsLoading={productsLoading}
          submitting={submitting}
          onClose={() => {
            setShowForm(false);
            setEditingPurchase(null);
          }}
          onSave={handleSavePurchase}
        />
      )}

      {/* PURCHASE DETAILS */}
      {selectedPurchase && (
        <PurchaseDetails
          purchase={selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
          onDeleteItem={handleDeleteItem}
        />
      )}
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            ₹{formatMoney(value)}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PURCHASE FORM
========================================================= */

function PurchaseForm({
  purchase,
  vendors,
  vendorsLoading,
  products,
  productsLoading,
  submitting,
  onClose,
  onSave,
}) {
  const [purchaseNumber, setPurchaseNumber] = useState(
    purchase?.purchaseNumber || `PUR-${Date.now().toString().slice(-6)}`
  );

  const [date, setDate] = useState(
    purchase?.date || new Date().toISOString().slice(0, 10)
  );

  const [vendorId, setVendorId] = useState(purchase?.vendorId || "");

  const [items, setItems] = useState(
    purchase?.items?.length
      ? purchase.items
      : [
          {
            id: generateId("item"),
            productId: "",
            productName: "",
            quantity: 1,
            rate: 0,
            discount: 0,
            gstRate: 18,
          },
        ]
  );

  const [paidAmount, setPaidAmount] = useState(purchase?.paidAmount || 0);

  const selectedVendor = vendors.find(
    (vendor) => String(vendor.id) === String(vendorId)
  );

  const subtotal = items.reduce((total, item) => {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const discount = Number(item.discount) || 0;
    return total + Math.max(0, quantity * rate - discount);
  }, 0);

  const totalTax = items.reduce((total, item) => {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const discount = Number(item.discount) || 0;
    const gstRate = Number(item.gstRate) || 0;
    const taxable = Math.max(0, quantity * rate - discount);
    return total + (taxable * gstRate) / 100;
  }, 0);

  const grandTotal = subtotal + totalTax;

  const safePaidAmount = Math.min(
    Math.max(Number(paidAmount) || 0, 0),
    grandTotal
  );

  const dueAmount = grandTotal - safePaidAmount;

  let paymentStatus = "unpaid";
  if (grandTotal <= 0) {
    paymentStatus = "unpaid";
  } else if (safePaidAmount >= grandTotal) {
    paymentStatus = "paid";
  } else if (safePaidAmount > 0) {
    paymentStatus = "partial";
  }

  const updateItem = (itemId, field, value) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== itemId) return item;

        if (field === "productId") {
          const selectedProduct = products.find(
            (product) => String(product.id) === String(value)
          );

          return {
            ...item,
            productId: value,
            productName: selectedProduct ? selectedProduct.name : "",
            rate: selectedProduct ? selectedProduct.purchasePrice : 0,
            gstRate: selectedProduct
              ? selectedProduct.gstRate
              : item.gstRate,
          };
        }

        return { ...item, [field]: value };
      })
    );
  };

  const addItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      {
        id: generateId("item"),
        productId: "",
        productName: "",
        quantity: 1,
        rate: 0,
        discount: 0,
        gstRate: 18,
      },
    ]);
  };

  const removeItem = (itemId) => {
    if (items.length === 1) return;
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId)
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!vendorId) {
      toast.error("Please select a vendor.");
      return;
    }

    const invalidProduct = items.some(
      (item) => !item.productId || !item.productName
    );

    if (invalidProduct) {
      toast.error("Please select a product for every item.");
      return;
    }

    // NEUTRAL shape — not tied to either backend route's field names.
    // Purchases' handleSavePurchase converts this into the exact
    // shape /api/purchase/add or /api/purchase/update expects, since
    // those two routes read different field names for the same data.
    const purchaseData = {
      purchaseNumber,
      date,
      vendorId,
      vendorName: selectedVendor ? selectedVendor.name : "",
      vendorPhone: selectedVendor ? selectedVendor.phone : "",
      items: items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        rate: item.rate,
        discount: item.discount,
        gstRate: item.gstRate,
      })),
      subtotal,
      totalTax,
      total: grandTotal,
      paid: safePaidAmount,
      dueAmount,
      status: paymentStatus,
    };

    onSave(purchaseData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* FORM HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {purchase ? "Edit Purchase" : "Create Purchase"}
            </h2>
            <p className="text-xs text-slate-400">Purchase bill details</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        {/* FORM BODY */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <FormField label="Purchase Number">
              <input
                type="text"
                value={purchaseNumber}
                onChange={(event) => setPurchaseNumber(event.target.value)}
                className={inputClass}
              />
            </FormField>

            <FormField label="Purchase Date">
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className={inputClass}
              />
            </FormField>

            <FormField label="Vendor *">
              <select
                value={vendorId}
                onChange={(event) => setVendorId(event.target.value)}
                className={inputClass}
              >
                <option value="">
                  {vendorsLoading
                    ? "Loading vendors..."
                    : vendors.length === 0
                    ? "No vendors available"
                    : "Select vendor"}
                </option>

                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>

              {!vendorsLoading && vendors.length === 0 && (
                <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle size={13} />
                  No vendors found. Add a vendor first.
                </p>
              )}
            </FormField>
          </div>

          {/* ITEMS */}
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Purchase Items</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Add products purchased from this vendor.
                </p>
              </div>

              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-600 transition hover:bg-orange-100"
              >
                <Plus size={15} />
                Add Item
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[900px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400">
                      Product
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400">
                      Qty
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400">
                      Rate
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400">
                      Discount
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-400">
                      GST %
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-slate-400">
                      Amount
                    </th>
                    <th className="w-12" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const quantity = Number(item.quantity) || 0;
                    const rate = Number(item.rate) || 0;
                    const discount = Number(item.discount) || 0;
                    const amount = Math.max(0, quantity * rate - discount);

                    return (
                      <tr key={item.id}>
                        <td className="p-2">
                          <select
                            value={item.productId}
                            onChange={(event) =>
                              updateItem(
                                item.id,
                                "productId",
                                event.target.value
                              )
                            }
                            className={smallInputClass}
                          >
                            <option value="">
                              {productsLoading
                                ? "Loading products..."
                                : products.length === 0
                                ? "No products available"
                                : "Select product"}
                            </option>

                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(event) =>
                              updateItem(
                                item.id,
                                "quantity",
                                event.target.value
                              )
                            }
                            className={smallInputClass}
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(event) =>
                              updateItem(item.id, "rate", event.target.value)
                            }
                            className={smallInputClass}
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.discount}
                            onChange={(event) =>
                              updateItem(
                                item.id,
                                "discount",
                                event.target.value
                              )
                            }
                            className={smallInputClass}
                          />
                        </td>

                        <td className="p-2">
                          <select
                            value={item.gstRate}
                            onChange={(event) =>
                              updateItem(
                                item.id,
                                "gstRate",
                                event.target.value
                              )
                            }
                            className={smallInputClass}
                          >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                          </select>
                        </td>

                        <td className="p-2 text-right">
                          <span className="text-sm font-bold text-slate-800">
                            ₹{formatMoney(amount)}
                          </span>
                        </td>

                        <td className="p-2">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* TOTALS */}
          <div className="mt-8 flex justify-end">
            <div className="w-full max-w-md rounded-xl bg-slate-50 p-5">
              <div className="space-y-3">
                <TotalRow label="Subtotal" value={subtotal} />
                <TotalRow label="GST" value={totalTax} />

                <div className="border-t border-slate-200 pt-3">
                  <TotalRow label="Grand Total" value={grandTotal} strong />
                </div>

                <div className="pt-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Paid Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paidAmount}
                    onChange={(event) => setPaidAmount(event.target.value)}
                    className={inputClass}
                  />
                </div>

                <TotalRow label="Due Amount" value={dueAmount} danger />

                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      Payment Status
                    </span>
                    <StatusBadge status={paymentStatus} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Saving..."
              : purchase
              ? "Update Purchase"
              : "Save Purchase"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   PURCHASE DETAILS
========================================================= */

function PurchaseDetails({ purchase, onClose, onDeleteItem }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="font-bold text-slate-900">
              {purchase.purchaseNumber}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Purchase ID: {purchase.id ?? "—"} · {formatDate(purchase.date)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={19} />
          </button>
        </div>

        {/* BODY */}
        <div className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">Vendor</p>
              <p className="mt-1 font-semibold text-slate-800">
                {purchase.vendorName}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">Vendor Phone</p>
              <p className="mt-1 font-semibold text-slate-800">
                {purchase.vendorPhone || "—"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">Payment Status</p>
              <div className="mt-2">
                <StatusBadge status={purchase.paymentStatus} />
              </div>
            </div>
          </div>

          {/* ITEMS */}
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">
                      Product
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">
                      Rate
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">
                      Discount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">
                      GST
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">
                      Amount
                    </th>
                    <th className="w-12" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {purchase.items?.map((item) => {
                    const amount = Math.max(
                      0,
                      Number(item.quantity) * Number(item.rate) -
                        Number(item.discount)
                    );

                    return (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm font-medium text-slate-700">
                          {item.productName}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-600">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-600">
                          ₹{formatMoney(item.rate)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-600">
                          ₹{formatMoney(item.discount)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-600">
                          {item.gstRate}%
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">
                          ₹{formatMoney(amount)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            title="Remove item(s)"
                            onClick={() =>
                              onDeleteItem(purchase.id, item.productId)
                            }
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* TOTAL */}
          <div className="ml-auto max-w-sm rounded-xl bg-slate-50 p-5">
            <div className="space-y-3">
              <TotalRow label="Subtotal" value={purchase.subtotal} />
              <TotalRow label="GST" value={purchase.totalTax} />

              <div className="border-t border-slate-200 pt-3">
                <TotalRow
                  label="Grand Total"
                  value={purchase.grandTotal}
                  strong
                />
              </div>

              <TotalRow label="Paid" value={purchase.paidAmount} />
              <TotalRow label="Due" value={purchase.dueAmount} danger />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const config = {
    paid: { label: "Paid", className: "bg-green-50 text-green-600" },
    partial: {
      label: "Partial",
      className: "bg-orange-50 text-orange-600",
    },
    unpaid: { label: "Unpaid", className: "bg-red-50 text-red-600" },
  };

  const current = config[status] || config.unpaid;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${current.className}`}
    >
      {current.label}
    </span>
  );
}

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </label>
      {children}
    </div>
  );
}

/* =========================================================
   TOTAL ROW
========================================================= */

function TotalRow({ label, value, strong = false, danger = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={`text-sm ${
          strong ? "font-bold text-slate-900" : "text-slate-500"
        }`}
      >
        {label}
      </span>
      <span
        className={`${
          strong ? "text-lg font-bold" : "text-sm font-semibold"
        } ${danger ? "text-red-500" : "text-slate-800"}`}
      >
        ₹{formatMoney(value)}
      </span>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function generateId(prefix = "item") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   CSS CLASSES
========================================================= */

const inputClass = `
  h-11
  w-full
  rounded-xl
  border
  border-slate-200
  bg-white
  px-3
  text-sm
  text-slate-800
  outline-none
  transition
  focus:border-orange-400
  focus:ring-2
  focus:ring-orange-100
`;

const smallInputClass = `
  h-10
  w-full
  rounded-lg
  border
  border-slate-200
  bg-white
  px-2
  text-sm
  text-slate-800
  outline-none
  transition
  focus:border-orange-400
  focus:ring-2
  focus:ring-orange-100
`;
