"use client";

import { useEffect, useState } from "react";

import {

  collection,

  getDocs,

} from "firebase/firestore";

import {

  onAuthStateChanged,

  signOut,

  User,

} from "firebase/auth";

import { useRouter } from "next/navigation";

import { db, auth } from "@/app/lib/firebase";

type Order = {

  id: string;

  total?: number;

  totalPrice?: number;

  productsTotal?: number;

  phone?: string;

  customerPhone?: string;

  status?: string;

};

type Product = {

  id: string;

  price?: number;

  stock?: number;

};

export default function AdminDashboard() {

  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [authLoading, setAuthLoading] = useState(true);

  const [orders, setOrders] = useState<Order[]>([]);

  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(

      auth,

      (currentUser) => {

        if (!currentUser) {

          router.replace("/admin/login");

          return;

        }

        setUser(currentUser);

        setAuthLoading(false);

      }

    );

    return () => unsubscribe();

  }, [router]);

  useEffect(() => {

    if (user) {

      loadDashboard();

    }

  }, [user]);

  async function loadDashboard() {

    try {

      setLoading(true);

      const ordersSnapshot = await getDocs(

        collection(db, "orders")

      );

      const loadedOrders: Order[] =

        ordersSnapshot.docs.map((item) => ({

          id: item.id,

          ...(item.data() as Omit<Order, "id">),

        }));

      const productsSnapshot = await getDocs(

        collection(db, "products")

      );

      const loadedProducts: Product[] =

        productsSnapshot.docs.map((item) => ({

          id: item.id,

          ...(item.data() as Omit<Product, "id">),

        }));

      setOrders(loadedOrders);

      setProducts(loadedProducts);

    } catch (error) {

      console.error("DASHBOARD ERROR:", error);

    } finally {

      setLoading(false);

    }

  }

  async function handleLogout() {

    try {

      await signOut(auth);

      router.replace("/admin/login");

    } catch (error) {

      console.error("LOGOUT ERROR:", error);

    }

  }

  if (authLoading) {

    return (

      <main className="loading-page" dir="rtl">

        <div>

          <strong>A.GO</strong>

          <p>جاري التحقق...</p>

        </div>

        <style jsx>{`

          .loading-page {

            min-height: 100vh;

            display: flex;

            align-items: center;

            justify-content: center;

            background: #f7f7f7;

            color: #111;

            text-align: center;

          }

          strong {

            font-size: 40px;

            letter-spacing: 3px;

          }

          p {

            color: #777;

            margin-top: 10px;

          }

        `}</style>

      </main>

    );

  }

  if (!user) {

    return null;

  }

  if (loading) {

    return (

      <main className="loading-page" dir="rtl">

        <div>

          <strong>A.GO</strong>

          <p>جاري تحميل لوحة التحكم...</p>

        </div>

        <style jsx>{`

          .loading-page {

            min-height: 100vh;

            display: flex;

            align-items: center;

            justify-content: center;

            background: #f7f7f7;

            color: #111;

            text-align: center;

          }

          strong {

            font-size: 40px;

            letter-spacing: 3px;

          }

          p {

            color: #777;

            margin-top: 10px;

          }

        `}</style>

      </main>

    );

  }

  const customers = new Set(

    orders

      .map(

        (order) =>

          order.phone ||

          order.customerPhone ||

          ""

      )

      .filter(Boolean)

  );

  const activeOrders = orders.filter(

    (order) => order.status !== "cancelled"

  );

  const sales = orders.reduce(

    (total, order) => {

      const orderTotal =

        Number(order.productsTotal) ||

        Number(order.totalPrice) ||

        Number(order.total) ||

        0;

      return total + orderTotal;

    },

    0

  );

  return (

    <main className="dashboard" dir="rtl">

      {/* HEADER */}

      <header className="header">

        <div className="heading">

          <div className="logo">

            A.GO

          </div>

          <h1>

            Dashboard

          </h1>

          <p>

            A.GO Store Overview

          </p>

        </div>

        <div className="actions">

          <button

            type="button"

            onClick={loadDashboard}

            className="refresh"

          >

            ↻ تحديث

          </button>

          <button

            type="button"

            onClick={handleLogout}

            className="logout"

          >

            تسجيل الخروج

          </button>

        </div>

      </header>

      {/* CARDS */}

      <section className="cards">

        {/* ORDERS */}

        <div className="card">

          <div className="card-label">

            ORDERS

          </div>

          <strong>

            {activeOrders.length}

          </strong>

          <span>

            الطلبات النشطة

          </span>

        </div>

        {/* PRODUCTS */}

        <div className="card">

          <div className="card-label">

            PRODUCTS

          </div>

          <strong>

            {products.length}

          </strong>

          <span>

            المنتجات

          </span>

        </div>

        {/* CUSTOMERS */}

        <div className="card">

          <div className="card-label">

            CUSTOMERS

          </div>

          <strong>

            {customers.size}

          </strong>

          <span>

            العملاء

          </span>

        </div>

        {/* SALES */}

        <div className="card sales">

          <div className="card-label">

            SALES

          </div>

          <strong>

            {sales.toLocaleString("en-US")}

          </strong>

          <span>

            EGP إجمالي المبيعات

          </span>

        </div>

      </section>

      <style jsx>{`

        .dashboard {

          min-height: 100vh;

          width: 100%;

          padding: 30px;

          box-sizing: border-box;

          background: #f7f7f7;

          color: #111;

        }

        .header {

          width: 100%;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          margin-bottom: 30px;

        }

        .heading {

          min-width: 0;

        }

        .logo {

          font-size: 20px;

          font-weight: 900;

          letter-spacing: 2px;

          margin-bottom: 8px;

        }

        h1 {

          margin: 0;

          font-size: 36px;

          font-weight: 900;

          line-height: 1.1;

        }

        .heading p {

          margin: 8px 0 0;

          color: #777;

          font-size: 15px;

        }

        .actions {

          display: flex;

          align-items: center;

          gap: 10px;

          flex-shrink: 0;

        }

        button {

          height: 48px;

          padding: 0 20px;

          border-radius: 12px;

          font-size: 14px;

          font-weight: 800;

          cursor: pointer;

          transition: 0.2s ease;

        }

        .refresh {

          border: none;

          background: #111;

          color: #fff;

        }

        .refresh:hover {

          opacity: 0.85;

          transform: translateY(-1px);

        }

        .logout {

          border: 1px solid #ddd;

          background: #fff;

          color: #111;

        }

        .logout:hover {

          background: #111;

          color: #fff;

          border-color: #111;

        }

        .cards {

          width: 100%;

          display: grid;

          grid-template-columns:

            repeat(4, minmax(0, 1fr));

          gap: 20px;

        }

        .card {

          min-width: 0;

          background: #fff;

          border: 1px solid #e8e8e8;

          border-radius: 20px;

          padding: 28px 22px;

          box-sizing: border-box;

          box-shadow:

            0 8px 25px

            rgba(0, 0, 0, 0.05);

        }

        .card-label {

          color: #999;

          font-size: 11px;

          font-weight: 900;

          letter-spacing: 1.5px;

          margin-bottom: 14px;

        }

        .card strong {

          display: block;

          color: #111;

          font-size: 42px;

          font-weight: 900;

          line-height: 1.1;

          overflow-wrap: anywhere;

        }

        .card span {

          display: block;

          margin-top: 10px;

          color: #777;

          font-size: 14px;

          font-weight: 700;

        }

        .sales strong {

          font-size: 34px;

        }

        @media (max-width: 1000px) {

          .cards {

            grid-template-columns:

              repeat(2, minmax(0, 1fr));

          }

        }

        @media (max-width: 600px) {

          .dashboard {

            padding: 16px;

          }

          .header {

            flex-direction: column;

            align-items: stretch;

            gap: 18px;

          }

          h1 {

            font-size: 30px;

          }

          .heading p {

            font-size: 14px;

          }

          .actions {

            width: 100%;

            display: grid;

            grid-template-columns: 1fr 1fr;

          }

          .actions button {

            width: 100%;

            padding: 0 10px;

          }

          .cards {

            grid-template-columns: 1fr;

            gap: 14px;

          }

          .card {

            padding: 23px 20px;

            border-radius: 17px;

          }

          .card strong {

            font-size: 36px;

          }

          .sales strong {

            font-size: 30px;

          }

        }

        @media (max-width: 380px) {

          .dashboard {

            padding: 14px;

          }

          .actions {

            grid-template-columns: 1fr;

          }

          .card strong {

            font-size: 32px;

          }

          .sales strong {

            font-size: 27px;

          }

        }

      `}</style>

    </main>

  );

}