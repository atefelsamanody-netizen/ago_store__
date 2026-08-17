"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";

import { auth } from "@/app/lib/firebase";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");

    if (!email.trim()) {
      setError("اكتب البريد الإلكتروني.");
      return;
    }

    if (!password) {
      setError("اكتب كلمة المرور.");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      router.replace("/admin/dashboard");
    } catch (error: any) {
      console.error("ADMIN LOGIN ERROR:", error);

      setError(
        "البريد الإلكتروني أو كلمة المرور غير صحيحة."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page" dir="rtl">
      <div className="login-box">

        <div className="logo">
          A.GO
        </div>

        <h1>Admin Login</h1>

        <p>
          تسجيل الدخول إلى لوحة التحكم
        </p>

        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          autoComplete="email"
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
        />

        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          autoComplete="current-password"
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLogin();
            }
          }}
        />

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading
            ? "جاري الدخول..."
            : "دخول"}
        </button>

      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #f7f7f7;
          box-sizing: border-box;
        }

        .login-box {
          width: 100%;
          max-width: 420px;
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 24px;
          padding: 35px 28px;
          box-sizing: border-box;
          text-align: center;
          box-shadow:
            0 15px 45px rgba(0, 0, 0, 0.08);
        }

        .logo {
          font-size: 40px;
          font-weight: 900;
          letter-spacing: 3px;
          color: #111;
          margin-bottom: 25px;
        }

        h1 {
          margin: 0;
          color: #111;
          font-size: 28px;
          font-weight: 800;
        }

        p {
          margin: 10px 0 25px;
          color: #777;
          font-size: 14px;
        }

        input {
          width: 100%;
          height: 52px;
          margin-bottom: 12px;
          padding: 0 16px;
          box-sizing: border-box;

          border: 1px solid #ddd;
          border-radius: 13px;

          background: #fff;
          color: #111;

          font-size: 16px;
          outline: none;
        }

        input:focus {
          border-color: #111;
        }

        button {
          width: 100%;
          height: 52px;
          margin-top: 5px;

          border: none;
          border-radius: 13px;

          background: #111;
          color: #fff;

          font-size: 16px;
          font-weight: 800;

          cursor: pointer;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error {
          margin: 5px 0 12px;
          color: #c00000;
          font-size: 14px;
          font-weight: 700;
        }

        @media (max-width: 600px) {
          .login-page {
            padding: 16px;
          }

          .login-box {
            padding: 30px 20px;
            border-radius: 20px;
          }

          .logo {
            font-size: 34px;
          }

          h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </main>
  );
}