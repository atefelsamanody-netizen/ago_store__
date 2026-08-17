"use client";

import { useEffect, useMemo, useState } from "react";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

import { db } from "../../lib/firebase";

/* =========================================================
   TYPES
========================================================= */

type Product = {
  id?: string;
  slug?: string;
  name?: string;
  image?: string;
  color?: any;
  size?: string;
  qty?: number;
  price?: number;
  hiddenMessage?: string | null;
};

type Customer = {
  name?: string;
  phone?: string;
  governorate?: string;
  city?: string;
  address?: string;
};

type Order = {
  id: string;

  customer?: Customer;

  products?: Product[];

  total?: number;
  productsTotal?: number;
  couponDiscount?: number;
  couponCode?: string | null;

  shipping?: number;
  finalTotal?: number;

  paymentType?: "full" | "deposit";
  paymentStatus?: string;

  paidAmount?: number;
  deposit?: number;
  depositAmount?: number;

  remaining?: number;
  remainingProducts?: number;
  amountToCollect?: number;

  /* بيانات التحويل */
  payerAccount?: string;
  transferAmount?: number;
  paymentSubmittedAt?: any;

  status?: string;

  createdAt?: any;
  updatedAt?: any;
};

/* =========================================================
   STATUS OPTIONS
========================================================= */

const STATUS_OPTIONS = [
  {
    value: "new",
    label: "طلب جديد",
    icon: "🆕",
  },
  {
    value: "confirmed",
    label: "تم تأكيد الطلب",
    icon: "✅",
  },
  {
    value: "preparing",
    label: "جاري تجهيز الطلب",
    icon: "📦",
  },
  {
    value: "shipped",
    label: "تم شحن الطلب",
    icon: "🚚",
  },
  {
    value: "delivered",
    label: "تم تسليم الطلب",
    icon: "🎉",
  },
  {
    value: "cancelled",
    label: "تم إلغاء الطلب",
    icon: "❌",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function formatMoney(value: any) {
  return Number(value || 0).toLocaleString("en-US");
}

function getColorName(color: any) {
  if (!color) return "-";

  if (typeof color === "string") {
    return color;
  }

  return color.name || color.title || "-";
}

function getHiddenMessageName(message?: string | null) {
  if (!message) return "";

  return message.split("/").pop() || message;
}

function getPaymentLabel(order: Order) {
  if (
    order.paymentType === "deposit" ||
    order.paymentStatus === "deposit"
  ) {
    return "دفع عربون 30%";
  }

  return "دفع المبلغ بالكامل";
}

function getStatusLabel(status?: string) {
  const found = STATUS_OPTIONS.find(
    (item) => item.value === status
  );

  return found || STATUS_OPTIONS[0];
}

function getOrderDate(createdAt: any) {
  try {
    if (!createdAt) return "";

    if (createdAt instanceof Timestamp) {
      return createdAt.toDate().toLocaleString("ar-EG");
    }

    if (createdAt?.toDate) {
      return createdAt.toDate().toLocaleString("ar-EG");
    }

    if (typeof createdAt === "string") {
      return new Date(createdAt).toLocaleString("ar-EG");
    }

    if (createdAt?.seconds) {
      return new Date(
        createdAt.seconds * 1000
      ).toLocaleString("ar-EG");
    }

    return "";
  } catch {
    return "";
  }
}

function getPaymentDate(timestamp: any) {
  return getOrderDate(timestamp);
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [updatingOrder, setUpdatingOrder] =
    useState<string | null>(null);

  const [filter, setFilter] = useState<
    | "all"
    | "new"
    | "confirmed"
    | "preparing"
    | "shipped"
    | "delivered"
    | "cancelled"
  >("all");

  /* =========================================================
     LOAD ORDERS
  ========================================================= */

  useEffect(() => {
    const ordersRef = collection(db, "orders");

    const q = query(
      ordersRef,
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Order[] = snapshot.docs.map(
          (item) => ({
            id: item.id,
            ...(item.data() as Omit<Order, "id">),
          })
        );

        setOrders(data);
        setLoading(false);
      },
      (error) => {
        console.error(
          "ORDERS LOAD ERROR:",
          error
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredOrders = useMemo(() => {
    if (filter === "all") {
      return orders;
    }

    return orders.filter(
      (order) => order.status === filter
    );
  }, [orders, filter]);

  /* =========================================================
     CHANGE ORDER STATUS
  ========================================================= */

  async function changeOrderStatus(
    orderId: string,
    status: string
  ) {
    try {
      setUpdatingOrder(orderId);

      await updateDoc(
        doc(db, "orders", orderId),
        {
          status,
          updatedAt: Timestamp.now(),
        }
      );
    } catch (error) {
      console.error(
        "STATUS UPDATE ERROR:",
        error
      );

      alert(
        "حدث خطأ أثناء تحديث حالة الطلب."
      );
    } finally {
      setUpdatingOrder(null);
    }
  }

  /* =========================================================
     CONFIRM PAYMENT
  ========================================================= */

  async function confirmPayment(order: Order) {
    const transferAmount =
      Number(order.transferAmount || 0);

    if (transferAmount <= 0) {
      alert(
        "لا يوجد مبلغ تحويل مسجل لهذا الطلب."
      );

      return;
    }

    const confirmed = window.confirm(
      `هل تريد تأكيد استلام مبلغ ${formatMoney(
        transferAmount
      )} جنيه من ${
        order.payerAccount || "الحساب غير مسجل"
      }؟`
    );

    if (!confirmed) return;

    try {
      setUpdatingOrder(order.id);

      const finalTotal = Number(
        order.finalTotal ??
          order.total ??
          0
      );

      const currentPaid = Number(
        order.paidAmount ??
          order.depositAmount ??
          order.deposit ??
          0
      );

      const newPaidAmount =
        currentPaid + transferAmount;

      const newRemaining = Math.max(
        finalTotal - newPaidAmount,
        0
      );

      await updateDoc(
        doc(db, "orders", order.id),
        {
          paymentStatus: "paid",

          paidAmount:
            newPaidAmount,

          remaining:
            newRemaining,

          remainingProducts:
            newRemaining,

          amountToCollect:
            newRemaining,

          status:
            order.status ===
              "awaiting_payment_review"
              ? "confirmed"
              : order.status || "confirmed",

          paymentConfirmedAt:
            Timestamp.now(),

          updatedAt:
            Timestamp.now(),
        }
      );

      alert(
        "تم تأكيد الدفع بنجاح ✅"
      );
    } catch (error) {
      console.error(
        "CONFIRM PAYMENT ERROR:",
        error
      );

      alert(
        "حدث خطأ أثناء تأكيد الدفع."
      );
    } finally {
      setUpdatingOrder(null);
    }
  }

  /* =========================================================
     REJECT PAYMENT
  ========================================================= */

  async function rejectPayment(order: Order) {
    const confirmed = window.confirm(
      `هل تريد رفض التحويل ${
        order.transferAmount
          ? `بقيمة ${formatMoney(
              order.transferAmount
            )} جنيه`
          : ""
      }؟`
    );

    if (!confirmed) return;

    try {
      setUpdatingOrder(order.id);

      await updateDoc(
        doc(db, "orders", order.id),
        {
          paymentStatus:
            "rejected",

          status: "new",

          paymentRejectedAt:
            Timestamp.now(),

          updatedAt:
            Timestamp.now(),
        }
      );

      alert(
        "تم رفض التحويل ❌"
      );
    } catch (error) {
      console.error(
        "REJECT PAYMENT ERROR:",
        error
      );

      alert(
        "حدث خطأ أثناء رفض التحويل."
      );
    } finally {
      setUpdatingOrder(null);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <>
        <style jsx>{`
          .loading-page {
            min-height: 100vh;
            background: #f6f6f6;
            color: #111;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
            font-size: 18px;
            direction: rtl;
          }
        `}</style>

        <main className="loading-page">
          جاري تحميل الطلبات...
        </main>
      </>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <>
      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .orders-page {
          min-height: 100vh;
          background: #f5f5f5;
          color: #111;
          padding: 35px 20px 70px;
          direction: rtl;
          font-family:
            Arial,
            Tahoma,
            sans-serif;
        }

        .orders-container {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .page-header {
          background: #fff;
          border: 1px solid #e3e3e3;
          border-radius: 18px;
          padding: 25px;
          margin-bottom: 20px;
          box-shadow:
            0 4px 18px
            rgba(0, 0, 0, 0.05);
        }

        .page-header h1 {
          margin: 0 0 8px;
          font-size: 28px;
          font-weight: 800;
          color: #111;
        }

        .page-header p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 22px;
        }

        .filter-button {
          border: 1px solid #ddd;
          background: #fff;
          color: #222;
          border-radius: 10px;
          padding: 9px 15px;
          cursor: pointer;
          font-size: 13px;
          transition: 0.2s;
        }

        .filter-button:hover {
          border-color: #111;
        }

        .filter-button.active {
          background: #111;
          color: #fff;
          border-color: #111;
        }

        .empty {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 18px;
          padding: 50px 20px;
          text-align: center;
          color: #666;
        }

        /* =====================================================
           ORDER CARD
        ===================================================== */

        .order-card {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 18px;
          margin-bottom: 22px;
          overflow: hidden;
          box-shadow:
            0 5px 20px
            rgba(0, 0, 0, 0.05);
        }

        .order-header {
          padding: 18px 22px;
          border-bottom: 1px solid #e5e5e5;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
          background: #fafafa;
        }

        .order-number {
          font-size: 20px;
          font-weight: 800;
          color: #111;
        }

        .order-date {
          color: #777;
          font-size: 12px;
          margin-top: 4px;
        }

        .status-area {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .status-badge {
          border-radius: 9px;
          padding: 7px 11px;
          background: #111;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .status-select {
          border: 1px solid #ccc;
          border-radius: 9px;
          padding: 9px 12px;
          background: #fff;
          color: #111;
          font-size: 13px;
          cursor: pointer;
          min-width: 165px;
        }

        .status-select:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        /* =====================================================
           CUSTOMER
        ===================================================== */

        .customer-section {
          padding: 22px;
          border-bottom: 1px solid #e5e5e5;
        }

        .section-title {
          font-size: 16px;
          font-weight: 800;
          margin: 0 0 15px;
          color: #111;
        }

        .customer-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 10px 25px;
        }

        .customer-row {
          font-size: 14px;
          color: #222;
          line-height: 1.7;
        }

        .customer-row strong {
          color: #111;
        }

        .address-row {
          grid-column: 1 / -1;
          padding-top: 5px;
        }

        /* =====================================================
           PAYMENT
        ===================================================== */

        .payment-section {
          padding: 22px;
          border-bottom: 1px solid #e5e5e5;
        }

        .payment-type {
          display: inline-block;
          padding: 8px 12px;
          border-radius: 9px;
          background: #f0f0f0;
          color: #111;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 15px;
        }

        .money-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .money-box {
          border: 1px solid #e3e3e3;
          border-radius: 12px;
          padding: 13px;
          background: #fafafa;
        }

        .money-box span {
          display: block;
          color: #777;
          font-size: 12px;
          margin-bottom: 5px;
        }

        .money-box strong {
          display: block;
          color: #111;
          font-size: 16px;
        }

        .money-box.paid {
          border-color: #b9dfc2;
          background: #f3fbf5;
        }

        .money-box.paid strong {
          color: #16813b;
        }

        .money-box.remaining {
          border-color: #f0c2c2;
          background: #fff6f6;
        }

        .money-box.remaining strong {
          color: #c52c2c;
        }

        /* =====================================================
           TRANSFER REVIEW
        ===================================================== */

        .transfer-review {
          margin-top: 18px;
          border: 1px solid #ead7a2;
          background: #fffaf0;
          border-radius: 15px;
          padding: 18px;
        }

        .transfer-review.pending {
          border-color: #ead7a2;
          background: #fffaf0;
        }

        .transfer-review.approved {
          border-color: #b9dfc2;
          background: #f3fbf5;
        }

        .transfer-review.rejected {
          border-color: #f0c2c2;
          background: #fff6f6;
        }

        .transfer-review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 15px;
        }

        .transfer-review-title {
          font-size: 16px;
          font-weight: 800;
          color: #111;
        }

        .transfer-review-status {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 6px 11px;
          font-size: 12px;
          font-weight: 800;
          background: #111;
          color: #fff;
        }

        .transfer-review.pending
          .transfer-review-status {
          background: #9a6b00;
        }

        .transfer-review.approved
          .transfer-review-status {
          background: #16813b;
        }

        .transfer-review.rejected
          .transfer-review-status {
          background: #c52c2c;
        }

        .transfer-info-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .transfer-info-box {
          background: #fff;
          border: 1px solid #e6e6e6;
          border-radius: 11px;
          padding: 12px;
        }

        .transfer-info-box span {
          display: block;
          color: #777;
          font-size: 12px;
          margin-bottom: 6px;
        }

        .transfer-info-box strong {
          display: block;
          color: #111;
          font-size: 16px;
          word-break: break-word;
        }

        .transfer-amount {
          color: #16813b !important;
          font-size: 18px !important;
        }

        .transfer-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .confirm-payment-btn,
        .reject-payment-btn {
          border: 0;
          border-radius: 10px;
          padding: 11px 16px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s;
        }

        .confirm-payment-btn {
          background: #16813b;
          color: #fff;
        }

        .confirm-payment-btn:hover {
          background: #11652e;
        }

        .reject-payment-btn {
          background: #c52c2c;
          color: #fff;
        }

        .reject-payment-btn:hover {
          background: #9f2020;
        }

        .confirm-payment-btn:disabled,
        .reject-payment-btn:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .no-transfer {
          margin-top: 15px;
          padding: 12px;
          background: #f7f7f7;
          border: 1px dashed #ccc;
          border-radius: 10px;
          color: #777;
          font-size: 13px;
        }

        /* =====================================================
           PRODUCTS
        ===================================================== */

        .products-section {
          padding: 22px;
          border-bottom: 1px solid #e5e5e5;
        }

        .products-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .product-item {
          display: flex;
          align-items: center;
          gap: 13px;
          border: 1px solid #e4e4e4;
          border-radius: 13px;
          padding: 10px;
          background: #fff;
        }

        .product-image {
          width: 65px;
          height: 65px;
          min-width: 65px;
          border-radius: 9px;
          object-fit: cover;
          background: #eee;
          border: 1px solid #ddd;
        }

        .product-info {
          flex: 1;
          min-width: 0;
        }

        .product-name {
          font-size: 14px;
          font-weight: 800;
          color: #111;
          margin-bottom: 5px;
        }

        .product-details {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 14px;
          font-size: 12px;
          color: #666;
        }

        .product-price {
          font-size: 14px;
          font-weight: 800;
          color: #111;
          white-space: nowrap;
        }

        /* =====================================================
           TOTAL
        ===================================================== */

        .total-section {
          padding: 22px;
        }

        .total-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 7px 0;
          color: #333;
          font-size: 14px;
        }

        .total-line strong {
          color: #111;
        }

        .total-line.discount strong {
          color: #c52c2c;
        }

        .total-line.final {
          border-top: 1px solid #ddd;
          margin-top: 8px;
          padding-top: 15px;
          font-size: 17px;
          font-weight: 800;
        }

        .total-line.final strong {
          font-size: 20px;
        }

        .collection {
          margin-top: 12px;
          border-radius: 12px;
          padding: 13px 15px;
          background: #111;
          color: #fff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        .collection strong {
          font-size: 18px;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 800px) {
          .money-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .customer-grid {
            grid-template-columns: 1fr;
          }

          .address-row {
            grid-column: auto;
          }

          .transfer-info-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .orders-page {
            padding: 18px 10px 50px;
          }

          .page-header {
            padding: 18px;
            border-radius: 14px;
          }

          .page-header h1 {
            font-size: 23px;
          }

          .order-header {
            padding: 15px;
          }

          .order-number {
            font-size: 18px;
          }

          .status-area {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
          }

          .status-select {
            width: 100%;
          }

          .status-badge {
            text-align: center;
          }

          .customer-section,
          .payment-section,
          .products-section,
          .total-section {
            padding: 16px;
          }

          .money-grid {
            grid-template-columns: 1fr 1fr;
          }

          .product-image {
            width: 55px;
            height: 55px;
            min-width: 55px;
          }

          .product-price {
            font-size: 12px;
          }

          .collection {
            gap: 10px;
          }

          .transfer-actions {
            flex-direction: column;
          }

          .confirm-payment-btn,
          .reject-payment-btn {
            width: 100%;
          }
        }
      `}</style>

      <main className="orders-page">
        <div className="orders-container">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <section className="page-header">
            <h1>الطلبات</h1>

            <p>
              إدارة الطلبات وبيانات العملاء وحالة
              الطلب والدفع.
            </p>

            <div className="filters">

              <button
                className={`filter-button ${
                  filter === "all"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setFilter("all")
                }
              >
                كل الطلبات ({orders.length})
              </button>

              {STATUS_OPTIONS.map(
                (status) => {
                  const count =
                    orders.filter(
                      (order) =>
                        order.status ===
                        status.value
                    ).length;

                  return (
                    <button
                      key={status.value}
                      className={`filter-button ${
                        filter ===
                        status.value
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setFilter(
                          status.value as any
                        )
                      }
                    >
                      {status.icon}{" "}
                      {status.label}{" "}
                      ({count})
                    </button>
                  );
                }
              )}

            </div>
          </section>

          {/* =====================================================
              ORDERS
          ===================================================== */}

          {filteredOrders.length === 0 ? (
            <div className="empty">
              لا توجد طلبات هنا.
            </div>
          ) : (
            filteredOrders.map(
              (order, index) => {

                const products =
                  order.products || [];

                const productsTotal =
                  Number(
                    order.productsTotal ??
                      order.total ??
                      products.reduce(
                        (sum, product) =>
                          sum +
                          Number(
                            product.price || 0
                          ) *
                            Number(
                              product.qty || 1
                            ),
                        0
                      )
                  );

                const shipping = Number(
                  order.shipping || 0
                );

                const finalTotal =
                  Number(
                    order.finalTotal ??
                      productsTotal +
                        shipping
                  );

                const paidAmount =
                  Number(
                    order.paidAmount ??
                      order.depositAmount ??
                      order.deposit ??
                      0
                  );

                const remaining =
                  Number(
                    order.remaining ??
                      order.amountToCollect ??
                      Math.max(
                        finalTotal -
                          paidAmount,
                        0
                      )
                  );

                const amountToCollect =
                  Number(
                    order.amountToCollect ??
                      order.remaining ??
                      remaining
                  );

                const actualStatus =
                  order.status ||
                  "confirmed";

                const status =
                  getStatusLabel(
                    actualStatus
                  );

                const paymentPending =
                  order.paymentStatus ===
                    "pending_review" ||
                  order.status ===
                    "awaiting_payment_review";

                const paymentApproved =
                  order.paymentStatus ===
                  "paid";

                const paymentRejected =
                  order.paymentStatus ===
                  "rejected";

                const hasTransferData =
                  Boolean(
                    order.payerAccount ||
                      Number(
                        order.transferAmount ||
                          0
                      ) > 0
                  );

                return (
                  <article
                    key={order.id}
                    className="order-card"
                  >

                    {/* =================================================
                        ORDER HEADER
                    ================================================= */}

                    <div className="order-header">

                      <div>
                        <div className="order-number">
                          طلب رقم{" "}
                          {orders.length -
                            index}
                        </div>

                        {getOrderDate(
                          order.createdAt
                        ) && (
                          <div className="order-date">
                            {getOrderDate(
                              order.createdAt
                            )}
                          </div>
                        )}
                      </div>

                      <div className="status-area">

                        <div className="status-badge">
                          {status.icon}{" "}
                          {status.label}
                        </div>

                        <select
                          className="status-select"
                          value={
                            actualStatus
                          }
                          disabled={
                            updatingOrder ===
                            order.id
                          }
                          onChange={(e) =>
                            changeOrderStatus(
                              order.id,
                              e.target.value
                            )
                          }
                        >
                          {STATUS_OPTIONS.map(
                            (item) => (
                              <option
                                key={
                                  item.value
                                }
                                value={
                                  item.value
                                }
                              >
                                {item.icon}{" "}
                                {item.label}
                              </option>
                            )
                          )}
                        </select>

                      </div>

                    </div>

                    {/* =================================================
                        CUSTOMER
                    ================================================= */}

                    <section className="customer-section">

                      <h2 className="section-title">
                        بيانات العميل
                      </h2>

                      <div className="customer-grid">

                        <div className="customer-row">
                          <strong>
                            الاسم:
                          </strong>{" "}
                          {order.customer
                            ?.name || "-"}
                        </div>

                        <div className="customer-row">
                          <strong>
                            الهاتف:
                          </strong>{" "}
                          {order.customer
                            ?.phone || "-"}
                        </div>

                        <div className="customer-row">
                          <strong>
                            المحافظة:
                          </strong>{" "}
                          {order.customer
                            ?.governorate ||
                            "-"}
                        </div>

                        <div className="customer-row">
                          <strong>
                            المدينة:
                          </strong>{" "}
                          {order.customer
                            ?.city || "-"}
                        </div>

                        <div className="customer-row address-row">
                          <strong>
                            العنوان:
                          </strong>{" "}
                          {order.customer
                            ?.address || "-"}
                        </div>

                      </div>

                    </section>

                    {/* =================================================
                        PAYMENT
                    ================================================= */}

                    <section className="payment-section">

                      <h2 className="section-title">
                        الدفع
                      </h2>

                      <div className="payment-type">
                        {getPaymentLabel(
                          order
                        )}
                      </div>

                      <div className="money-grid">

                        <div className="money-box">
                          <span>
                            إجمالي المنتجات
                          </span>

                          <strong>
                            {formatMoney(
                              productsTotal
                            )}{" "}
                            جنيه
                          </strong>
                        </div>

                        <div className="money-box">
                          <span>
                            الشحن
                          </span>

                          <strong>
                            {formatMoney(
                              shipping
                            )}{" "}
                            جنيه
                          </strong>
                        </div>

                        <div className="money-box paid">
                          <span>
                            تم دفعه
                          </span>

                          <strong>
                            {formatMoney(
                              paidAmount
                            )}{" "}
                            جنيه
                          </strong>
                        </div>

                        <div className="money-box remaining">
                          <span>
                            المتبقي
                          </span>

                          <strong>
                            {formatMoney(
                              remaining
                            )}{" "}
                            جنيه
                          </strong>
                        </div>

                      </div>

                      {/* =================================================
                          TRANSFER REVIEW
                      ================================================= */}

                      {hasTransferData ? (

                        <div
                          className={`transfer-review ${
                            paymentPending
                              ? "pending"
                              : paymentApproved
                              ? "approved"
                              : paymentRejected
                              ? "rejected"
                              : ""
                          }`}
                        >

                          <div className="transfer-review-header">

                            <div className="transfer-review-title">
                              💸 بيانات التحويل
                            </div>

                            <div className="transfer-review-status">

                              {paymentPending
                                ? "في انتظار المراجعة"
                                : paymentApproved
                                ? "تم تأكيد الدفع"
                                : paymentRejected
                                ? "تم رفض التحويل"
                                : "بيانات تحويل"}

                            </div>

                          </div>

                          <div className="transfer-info-grid">

                            <div className="transfer-info-box">

                              <span>
                                الرقم / الحساب الذي حوّل منه العميل
                              </span>

                              <strong dir="ltr">
                                {order.payerAccount ||
                                  "-"}
                              </strong>

                            </div>

                            <div className="transfer-info-box">

                              <span>
                                مبلغ التحويل
                              </span>

                              <strong className="transfer-amount">
                                {formatMoney(
                                  order.transferAmount
                                )}{" "}
                                جنيه
                              </strong>

                            </div>

                            <div className="transfer-info-box">

                              <span>
                                وقت إرسال بيانات التحويل
                              </span>

                              <strong>
                                {getPaymentDate(
                                  order.paymentSubmittedAt
                                ) ||
                                  "غير متوفر"}
                              </strong>

                            </div>

                            <div className="transfer-info-box">

                              <span>
                                حالة الدفع
                              </span>

                              <strong>
                                {paymentPending
                                  ? "بانتظار التأكيد"
                                  : paymentApproved
                                  ? "الدفع مؤكد ✅"
                                  : paymentRejected
                                  ? "التحويل مرفوض ❌"
                                  : order.paymentStatus ||
                                    "غير محدد"}
                              </strong>

                            </div>

                          </div>

                          {/* =================================================
                              APPROVE / REJECT
                          ================================================= */}

                          {paymentPending && (

                            <div className="transfer-actions">

                              <button
                                type="button"
                                className="confirm-payment-btn"
                                disabled={
                                  updatingOrder ===
                                  order.id
                                }
                                onClick={() =>
                                  confirmPayment(
                                    order
                                  )
                                }
                              >
                                {updatingOrder ===
                                order.id
                                  ? "جاري التنفيذ..."
                                  : "✅ تأكيد استلام الدفع"}
                              </button>

                              <button
                                type="button"
                                className="reject-payment-btn"
                                disabled={
                                  updatingOrder ===
                                  order.id
                                }
                                onClick={() =>
                                  rejectPayment(
                                    order
                                  )
                                }
                              >
                                {updatingOrder ===
                                order.id
                                  ? "جاري التنفيذ..."
                                  : "❌ رفض التحويل"}
                              </button>

                            </div>

                          )}

                        </div>

                      ) : (

                        <div className="no-transfer">
                          لم يرسل العميل بيانات التحويل
                          حتى الآن.
                        </div>

                      )}

                    </section>

                    {/* =================================================
                        PRODUCTS
                    ================================================= */}

                    <section className="products-section">

                      <h2 className="section-title">
                        المنتجات
                      </h2>

                      <div className="products-list">

                        {products.map(
                          (
                            product,
                            productIndex
                          ) => (
                            <div
                              key={`${product.id || product.slug || "product"}-${productIndex}`}
                              className="product-item"
                            >

                              <img
                                className="product-image"
                                src={
                                  product.image ||
                                  "/product-01.png"
                                }
                                alt={
                                  product.name ||
                                  "Product"
                                }
                              />

                              <div className="product-info">

                                <div className="product-name">
                                  {product.name ||
                                    "منتج"}
                                </div>

                                <div className="product-details">

                                  <span>
                                    المقاس:{" "}
                                    <strong>
                                      {product.size ||
                                        "-"}
                                    </strong>
                                  </span>

                                  <span>
                                    اللون:{" "}
                                    <strong>
                                      {getColorName(
                                        product.color
                                      )}
                                    </strong>
                                  </span>

                                  <span>
                                    الكمية:{" "}
                                    <strong>
                                      {product.qty ||
                                        1}
                                    </strong>
                                  </span>

                                </div>

                                {product.hiddenMessage && (
                                  <div
                                    className="product-details"
                                    style={{
                                      marginTop:
                                        "4px",
                                    }}
                                  >
                                    الرسالة:{" "}
                                    {getHiddenMessageName(
                                      product.hiddenMessage
                                    )}
                                  </div>
                                )}

                              </div>

                              <div className="product-price">
                                {formatMoney(
                                  Number(
                                    product.price ||
                                      0
                                  ) *
                                    Number(
                                      product.qty ||
                                        1
                                    )
                                )}{" "}
                                جنيه
                              </div>

                            </div>
                          )
                        )}

                      </div>

                    </section>

                    {/* =================================================
                        TOTALS
                    ================================================= */}

                    <section className="total-section">

                      <div className="total-line">
                        <span>
                          إجمالي المنتجات
                        </span>

                        <strong>
                          {formatMoney(
                            productsTotal
                          )}{" "}
                          جنيه
                        </strong>
                      </div>

                      {Number(
                        order.couponDiscount || 0
                      ) > 0 && (
                        <div className="total-line discount">

                          <span>
                            الخصم
                          </span>

                          <strong>
                            -{" "}
                            {formatMoney(
                              order.couponDiscount
                            )}{" "}
                            جنيه
                          </strong>

                        </div>
                      )}

                      <div className="total-line">

                        <span>
                          الشحن
                        </span>

                        <strong>
                          {formatMoney(
                            shipping
                          )}{" "}
                          جنيه
                        </strong>

                      </div>

                      <div className="total-line final">

                        <span>
                          الإجمالي النهائي
                        </span>

                        <strong>
                          {formatMoney(
                            finalTotal
                          )}{" "}
                          جنيه
                        </strong>

                      </div>

                      <div className="collection">

                        <span>
                          المطلوب تحصيله عند
                          الاستلام
                        </span>

                        <strong>
                          {formatMoney(
                            amountToCollect
                          )}{" "}
                          جنيه
                        </strong>

                      </div>

                    </section>

                  </article>
                );
              }
            )
          )}

        </div>
      </main>
    </>
  );
}