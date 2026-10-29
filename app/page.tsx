"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

type LandingSettings = {
  landingBackgroundColor: string;
  landingAccentColor: string;
  landingCircleSize: number;
  landingGlowStrength: number;
  landingButtonText: string;
  landingAnimationDuration: number;
  landingLightsEnabled: boolean;
  landingLogoUrl: string;
  landingMobileBackgroundColor: string;
  landingMobileAccentColor: string;
  landingMobileCircleSize: number;
  landingMobileGlowStrength: number;
  landingMobileAnimationDuration: number;
  landingMobileLightsEnabled: boolean;
};

const defaultLandingSettings: LandingSettings = {
  landingBackgroundColor: "#050505",
  landingAccentColor: "#d4af37",
  landingCircleSize: 260,
  landingGlowStrength: 20,
  landingButtonText: "ENTER STORE",
  landingAnimationDuration: 1200,
  landingLightsEnabled: true,
  landingLogoUrl: "",
  landingMobileBackgroundColor: "#050505",
  landingMobileAccentColor: "#d4af37",
  landingMobileCircleSize: 220,
  landingMobileGlowStrength: 16,
  landingMobileAnimationDuration: 1000,
  landingMobileLightsEnabled: true,
};

export default function Home() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<LandingSettings>(defaultLandingSettings);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadLandingSettings() {
      try {
        const settingsRef = doc(db, "settings", "store");
        const snapshot = await getDoc(settingsRef);

        if (active && snapshot.exists()) {
          const data = snapshot.data() as Partial<LandingSettings>;
          setSettings({ ...defaultLandingSettings, ...data });
        }
      } catch (error) {
        // Keep the original landing-screen design if settings cannot be loaded.
        console.error("LOAD LANDING SETTINGS ERROR:", error);
      } finally {
        if (active) setSettingsLoaded(true);
      }
    }

    void loadLandingSettings();
    return () => {
      active = false;
    };
  }, []);

  function enterStore() {
    if (open) return;
    setOpen(true);
    const isMobile = window.matchMedia("(max-width: 600px)").matches;
    const routeDelay = isMobile ? settings.landingMobileAnimationDuration : settings.landingAnimationDuration;
    window.setTimeout(() => {
      router.push("/products");
    }, Math.min(4000, Math.max(300, Number(routeDelay) || 1200)));
  }

  const circleSize = Math.min(420, Math.max(140, Number(settings.landingCircleSize) || 260));
  const glowStrength = Math.min(60, Math.max(0, Number(settings.landingGlowStrength) || 0));
  const animationDuration = Math.min(4000, Math.max(300, Number(settings.landingAnimationDuration) || 1200));
  const mobileCircleSize = Math.min(320, Math.max(120, Number(settings.landingMobileCircleSize) || 220));
  const mobileGlowStrength = Math.min(60, Math.max(0, Number(settings.landingMobileGlowStrength) || 0));
  const mobileAnimationDuration = Math.min(4000, Math.max(300, Number(settings.landingMobileAnimationDuration) || 1000));
  const logoSrc = settings.landingLogoUrl.trim() || "/logo.png";

  return (
    <main
      className={`screen ${open ? "open" : ""}`}
      style={{
        backgroundColor: settings.landingBackgroundColor,
        ["--landing-bg" as string]: settings.landingBackgroundColor,
        ["--landing-accent" as string]: settings.landingAccentColor,
        ["--landing-circle-size" as string]: `${circleSize}px`,
        ["--landing-glow" as string]: `${glowStrength / 100}`,
        ["--landing-glow-blur" as string]: `${Math.round(glowStrength * 1.5)}px`,
        ["--landing-glow-percent" as string]: `${glowStrength}%`,
        ["--landing-animation-duration" as string]: `${animationDuration}ms`,
        ["--landing-mobile-bg" as string]: settings.landingMobileBackgroundColor,
        ["--landing-mobile-accent" as string]: settings.landingMobileAccentColor,
        ["--landing-mobile-circle-size" as string]: `${mobileCircleSize}px`,
        ["--landing-mobile-glow-blur" as string]: `${Math.round(mobileGlowStrength * 1.5)}px`,
        ["--landing-mobile-glow-percent" as string]: `${mobileGlowStrength}%`,
        ["--landing-mobile-glow" as string]: `${mobileGlowStrength / 100}`,
        ["--landing-mobile-animation-duration" as string]: `${mobileAnimationDuration}ms`,
      } as CSSProperties}
    >
      {(settings.landingLightsEnabled || settings.landingMobileLightsEnabled) && <div className={`lights ${settings.landingLightsEnabled ? "desktop-lights-on" : "desktop-lights-off"} ${settings.landingMobileLightsEnabled ? "mobile-lights-on" : "mobile-lights-off"}`} aria-hidden="true" />}

      <div className="logoWrapper">
        <div className="doorCircle">
          <div className="leftDoor">
            <Image src={logoSrc} alt="A.GO" fill priority unoptimized={logoSrc.startsWith("http")} draggable={false} sizes="(max-width: 600px) 220px, 420px" />
          </div>
          <div className="rightDoor">
            <Image src={logoSrc} alt="A.GO" fill priority unoptimized={logoSrc.startsWith("http")} draggable={false} sizes="(max-width: 600px) 220px, 420px" />
          </div>
        </div>

        {!open && (
          <button type="button" className="enterBtn" onClick={enterStore} disabled={!settingsLoaded}>
            {settings.landingButtonText || "ENTER STORE"}
          </button>
        )}
      </div>

      <style jsx global>{`
        * { box-sizing: border-box; }

        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: var(--landing-bg, #050505);
          font-family: Arial, Helvetica, sans-serif;
        }

        body {
          background:
            radial-gradient(circle at top, color-mix(in srgb, var(--landing-accent, #d4af37) 8%, transparent), transparent 40%),
            radial-gradient(circle at bottom, rgba(255,255,255,0.03), transparent 40%),
            var(--landing-bg, #050505);
        }

        button { font-family: inherit; }

        .screen {
          position: relative;
          width: 100vw;
          height: 100vh;
          min-height: 100svh;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          border: none !important;
          background: var(--landing-bg, #050505);
        }

        .lights {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .lights::before, .lights::after {
          content: "";
          position: absolute;
          width: 700px;
          height: 700px;
          border-radius: 50%;
          filter: blur(140px);
          animation: floatLight 8s ease-in-out infinite;
        }

        .lights::before {
          background: color-mix(in srgb, var(--landing-accent, #d4af37) var(--landing-glow-percent, 20%), transparent);
          opacity: 0.6;
          left: -220px;
          top: -180px;
        }

        .lights::after {
          background: rgba(255,255,255,0.05);
          right: -220px;
          bottom: -180px;
          animation-delay: 4s;
        }

        @keyframes floatLight {
          0% { transform: translate(0, 0); }
          50% { transform: translate(40px, 30px); }
          100% { transform: translate(0, 0); }
        }

        .logoWrapper {
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          background: transparent !important;
        }

        .doorCircle {
          position: relative;
          width: min(var(--landing-circle-size, 260px), calc(100vw - 48px));
          height: min(var(--landing-circle-size, 260px), calc(100vw - 48px));
          border-radius: 50%;
          overflow: hidden;
          box-shadow:
            0 0 var(--landing-glow-blur, 30px) color-mix(in srgb, var(--landing-accent, #d4af37) 20%, transparent),
            0 0 calc(var(--landing-glow-blur, 30px) * 2.3) color-mix(in srgb, var(--landing-accent, #d4af37) 8%, transparent);
          background: var(--landing-bg, #050505);
          border: none !important;
          outline: none !important;
        }

        .leftDoor, .rightDoor {
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          overflow: hidden;
          transition: transform var(--landing-animation-duration, 1200ms) cubic-bezier(0.77, 0, 0.18, 1);
          will-change: transform;
        }

        .leftDoor { left: 0; transform-origin: left center; }
        .rightDoor { right: 0; transform-origin: right center; }

        .leftDoor img, .rightDoor img {
          position: absolute !important;
          width: var(--landing-circle-size, 260px) !important;
          height: var(--landing-circle-size, 260px) !important;
          max-width: none !important;
          object-fit: cover;
        }

        .leftDoor img { left: 0 !important; top: 0 !important; object-position: left center; }
        .rightDoor img { right: 0 !important; top: 0 !important; left: auto !important; object-position: right center; }

        .open .leftDoor { transform: translateX(-105%); }
        .open .rightDoor { transform: translateX(105%); }

        .enterBtn {
          margin-top: 40px;
          padding: 16px 42px;
          border: none !important;
          outline: none !important;
          border-radius: 999px;
          background: var(--landing-accent, #d4af37);
          color: #111;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          box-shadow: 0 0 var(--landing-glow-blur, 25px) color-mix(in srgb, var(--landing-accent, #d4af37) 45%, transparent);
          transition: transform 0.35s ease, box-shadow 0.35s ease, opacity 0.35s ease;
        }

        .enterBtn:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.05);
          box-shadow:
            0 0 35px color-mix(in srgb, var(--landing-accent, #d4af37) 80%, transparent),
            0 0 70px color-mix(in srgb, var(--landing-accent, #d4af37) 25%, transparent);
        }

        .enterBtn:active { transform: scale(0.98); }
        .enterBtn:focus { outline: none !important; }
        .enterBtn:disabled { cursor: wait; opacity: 0.8; }
        .open .enterBtn { opacity: 0; pointer-events: none; }

        .lights.desktop-lights-off { display: none; }

        @media (max-width: 600px) {
          .lights.mobile-lights-off { display: none; }
          .screen { background-color: var(--landing-mobile-bg, #050505) !important; }
          body { background: var(--landing-mobile-bg, #050505); }
          .doorCircle {
            width: min(var(--landing-mobile-circle-size, 220px), calc(100vw - 48px));
            height: min(var(--landing-mobile-circle-size, 220px), calc(100vw - 48px));
            background: var(--landing-mobile-bg, #050505);
            box-shadow:
              0 0 var(--landing-mobile-glow-blur, 24px) color-mix(in srgb, var(--landing-mobile-accent, #d4af37) 20%, transparent),
              0 0 calc(var(--landing-mobile-glow-blur, 24px) * 2.3) color-mix(in srgb, var(--landing-mobile-accent, #d4af37) 8%, transparent);
          }
          .leftDoor, .rightDoor { transition-duration: var(--landing-mobile-animation-duration, 1000ms); }
          .leftDoor img, .rightDoor img {
            width: min(var(--landing-mobile-circle-size, 220px), calc(100vw - 48px)) !important;
            height: min(var(--landing-mobile-circle-size, 220px), calc(100vw - 48px)) !important;
          }
          .enterBtn {
            margin-top: 32px;
            padding: 14px 34px;
            font-size: 16px;
            background: var(--landing-mobile-accent, #d4af37);
            box-shadow: 0 0 var(--landing-mobile-glow-blur, 24px) color-mix(in srgb, var(--landing-mobile-accent, #d4af37) 45%, transparent);
          }
          .lights::before { background: color-mix(in srgb, var(--landing-mobile-accent, #d4af37) var(--landing-mobile-glow-percent, 16%), transparent); }
          .lights::after { opacity: var(--landing-mobile-glow, 0.16); }
        }

        @media (prefers-reduced-motion: reduce) {
          .lights::before, .lights::after { animation: none; }
          .leftDoor, .rightDoor, .enterBtn { transition-duration: 0.01ms; }
        }
      `}</style>
    </main>
  );
}