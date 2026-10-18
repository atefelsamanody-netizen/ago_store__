"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

type StoreSettings = {
  storeName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  logoUrl: string;
  heroButtonText: string;
  heroButtonLink: string;
  storeActive: boolean;
  maintenanceMode: boolean;
};

const defaults: StoreSettings = {
  storeName: "A.GO",
  tagline: "Always Go Original",
  primaryColor: "#d4af37",
  secondaryColor: "#111111",
  backgroundColor: "#050505",
  logoUrl: "/logo.png",
  heroButtonText: "ENTER STORE",
  heroButtonLink: "/products",
  storeActive: true,
  maintenanceMode: false,
};

export default function Home() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(defaults);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const snapshot = await getDoc(doc(db, "settings", "store"));

        if (snapshot.exists() && !cancelled) {
          const data = snapshot.data();

          setSettings({
            ...defaults,
            ...data,
            logoUrl: data.logoUrl?.trim() || defaults.logoUrl,
            backgroundColor:
              data.backgroundColor || defaults.backgroundColor,
          });
        }
      } catch (error) {
        console.error("Could not load store settings:", error);
      } finally {
        if (!cancelled) setSettingsLoaded(true);
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  function enterStore() {
    if (open || !settingsLoaded) return;

    setOpen(true);

    window.setTimeout(() => {
      const target = settings.heroButtonLink || "/products";
      router.push(target);
    }, 1200);
  }

  const maintenance =
    settings.maintenanceMode || !settings.storeActive;

  return (
    <main
      className={`screen ${open ? "open" : ""}`}
      style={
        {
          "--primary": settings.primaryColor,
          "--secondary": settings.secondaryColor,
          "--background": settings.backgroundColor,
        } as React.CSSProperties
      }
    >
      <div className="lights" />

      <div className="logoWrapper">
        <div className="doorCircle">
          <div className="leftDoor">
            <Image
              src={settings.logoUrl}
              alt={settings.storeName}
              fill
              priority
              draggable={false}
              sizes="260px"
              unoptimized={settings.logoUrl.startsWith("http")}
            />
          </div>

          <div className="rightDoor">
            <Image
              src={settings.logoUrl}
              alt={settings.storeName}
              fill
              priority
              draggable={false}
              sizes="260px"
              unoptimized={settings.logoUrl.startsWith("http")}
            />
          </div>
        </div>

       
        {maintenance ? (
          <div className="statusMessage">
            المتجر متوقف مؤقتًا، سنعود قريبًا.
          </div>
        ) : (
          <button
            type="button"
            className="enterBtn"
            onClick={enterStore}
            disabled={!settingsLoaded || open}
          >
            {!settingsLoaded
              ? "LOADING..."
              : open
                ? "WELCOME"
                : settings.heroButtonText}
          </button>
        )}
      </div>

      <style jsx global>{`

      .logoWrapper {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.doorCircle {
  border: none !important;
  outline: none !important;
  border-radius: 50%;
  background: transparent;
  box-shadow: 0 0 30px rgba(212, 175, 55, 0.2);
}

.enterBtn {
  margin-top: 35px;
  border: none !important;
  outline: none !important;
}
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
          background: #050505;
          font-family: Arial, Helvetica, sans-serif;
        }

        body {
          overflow-x: hidden;
        }

        button {
          font-family: inherit;
        }

        .screen {
          position: relative;
          width: 100%;
          min-height: 100vh;
          min-height: 100svh;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          background: var(--background, #050505);
          color: #fff;
        }

        .lights {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .lights::before,
        .lights::after {
          content: "";
          position: absolute;
          width: 700px;
          height: 700px;
          border-radius: 50%;
          filter: blur(140px);
          animation: floatLight 8s ease-in-out infinite;
        }

        .lights::before {
          background: var(--primary, #d4af37);
          opacity: 0.12;
          left: -220px;
          top: -180px;
        }

        .lights::after {
          background: var(--secondary, #111);
          opacity: 0.35;
          right: -220px;
          bottom: -180px;
          animation-delay: 4s;
        }

        @keyframes floatLight {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(40px, 30px);
          }
        }

        .logoWrapper {
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          text-align: center;
        }

        .doorCircle {
          position: relative;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          overflow: hidden;
          background: #050505;
          box-shadow:
            0 0 30px color-mix(in srgb, var(--primary) 35%, transparent),
            0 0 70px color-mix(in srgb, var(--primary) 15%, transparent);
        }

        .leftDoor,
        .rightDoor {
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          overflow: hidden;
          transition: transform 1.2s cubic-bezier(.77, 0, .18, 1);
          will-change: transform;
        }

        .leftDoor {
          left: 0;
          transform-origin: left center;
        }

        .rightDoor {
          right: 0;
          transform-origin: right center;
        }

        .leftDoor img,
        .rightDoor img {
          position: absolute !important;
          width: 260px !important;
          height: 260px !important;
          max-width: none !important;
          object-fit: cover;
        }

        .leftDoor img {
          left: 0 !important;
          top: 0 !important;
          object-position: left center;
        }

        .rightDoor img {
          right: 0 !important;
          top: 0 !important;
          left: auto !important;
          object-position: right center;
        }

        .open .leftDoor {
          transform: translateX(-105%);
        }

        .open .rightDoor {
          transform: translateX(105%);
        }

        .brandText {
          margin-top: 22px;
        }

        .brandText h1 {
          margin: 0;
          color: var(--primary);
          font-size: 25px;
          letter-spacing: 3px;
        }

        .brandText p {
          margin: 8px 0 0;
          color: #ddd;
          font-size: 13px;
          letter-spacing: 1px;
        }

        .enterBtn {
          margin-top: 32px;
          padding: 16px 42px;
          border: 1px solid var(--primary);
          border-radius: 999px;
          background: var(--primary);
          color: #111;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
          box-shadow: 0 0 25px
            color-mix(in srgb, var(--primary) 45%, transparent);
          transition: transform .35s ease, box-shadow .35s ease;
        }

        .enterBtn:hover {
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 0 35px
            color-mix(in srgb, var(--primary) 80%, transparent);
        }

        .enterBtn:disabled {
          cursor: wait;
          opacity: .65;
        }

        .statusMessage {
          margin-top: 28px;
          padding: 14px 20px;
          border: 1px solid var(--primary);
          border-radius: 12px;
          color: #fff;
          background: rgba(0, 0, 0, .5);
        }

        @media (max-width: 600px) {
          .doorCircle {
            width: 220px;
            height: 220px;
          }

          .leftDoor img,
          .rightDoor img {
            width: 220px !important;
            height: 220px !important;
          }

          .brandText h1 {
            font-size: 21px;
          }

          .enterBtn {
            padding: 14px 34px;
            font-size: 14px;
          }
        }
      `}</style>
    </main>
  );
}