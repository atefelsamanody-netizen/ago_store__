"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

type Settings = {
  storeName: string;
  tagline: string;
  currency: string;
  shippingCost: number;
  depositPercent: number;
  hiddenMessagePrice: number;
  whatsapp: string;
  instagram: string;
  tiktok: string;
  storeActive: boolean;
  maintenanceMode: boolean;
  couponsEnabled: boolean;
  hiddenMessagesEnabled: boolean;
  featuredProductsEnabled: boolean;
  cartEnabled: boolean;
  checkoutEnabled: boolean;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  logoUrl: string;
  faviconUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  heroButtonLink: string;
  announcementText: string;
  footerText: string;
  showProductColors: boolean;
  showProductSizes: boolean;
  showProductStock: boolean;
  shippingEnabled: boolean;
  minimumOrderAmount: number;
bannerDesktopWidth: number;
bannerDesktopHeight: number;
bannerMobileWidth: number;
bannerMobileHeight: number;
  // START PAGE / LANDING SCREEN
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

const defaultSettings: Settings = {
  storeName: "A.GO",
  tagline: "Always Go Original",
  currency: "EGP",
  shippingCost: 125,
  depositPercent: 30,
  hiddenMessagePrice: 50,
  whatsapp: "",
  instagram: "",
  tiktok: "",
  storeActive: true,
  maintenanceMode: false,
  couponsEnabled: true,
  hiddenMessagesEnabled: true,
  featuredProductsEnabled: true,
  cartEnabled: true,
  checkoutEnabled: true,
  primaryColor: "#d4af37",
  secondaryColor: "#111111",
  backgroundColor: "#ffffff",
  textColor: "#111111",
  logoUrl: "",
  faviconUrl: "",
  heroTitle: "Always Go Original",
  heroSubtitle: "Original pieces. Original style.",
  heroButtonText: "Shop Now",
  heroButtonLink: "/products",
  announcementText: "",
  footerText: "A.GO — Always Go Original",
  showProductColors: true,
  showProductSizes: true,
  showProductStock: true,
  shippingEnabled: true,
  minimumOrderAmount: 0,
bannerDesktopWidth: 100,
bannerDesktopHeight: 420,
bannerMobileWidth: 100,
bannerMobileHeight: 240,
  // Defaults match the current A.GO landing screen
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

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const settingsRef = doc(db, "settings", "store");
      const snapshot = await getDoc(settingsRef);
      if (snapshot.exists()) {
        setSettings({
          ...defaultSettings,
          ...(snapshot.data() as Partial<Settings>),
        });
      }
    } catch (error) {
      console.error("LOAD SETTINGS ERROR:", error);
      setMessage("حدث خطأ أثناء تحميل الإعدادات.");
    } finally {
      setLoading(false);
    }
  }

  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setMessage("");
  }

  async function saveSettings() {
    try {
      setSaving(true);
      setMessage("");
      const settingsRef = doc(db, "settings", "store");
      await setDoc(settingsRef, settings, { merge: true });
      setMessage("✓ تم حفظ جميع الإعدادات بنجاح");
    } catch (error) {
      console.error("SAVE SETTINGS ERROR:", error);
      setMessage("حدث خطأ أثناء حفظ الإعدادات.");
    } finally {
      setSaving(false);
    }
  }

  const saveButton = (
    <button
      type="button"
      className="settings-save-btn"
      onClick={saveSettings}
      disabled={saving}
    >
      {saving ? "جاري الحفظ..." : "حفظ جميع التغييرات"}
    </button>
  );

  if (loading) {
    return (
      <main className="admin-settings-page">
        <div className="settings-loading">
          <h1>Settings</h1>
          <p>جاري تحميل إعدادات المتجر...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-settings-page">
      <header className="settings-header">
        <div>
          <span className="settings-eyebrow">A.GO CONTROL CENTER</span>
          <h1 className="admin-title">Settings</h1>
          <p>مركز التحكم الرئيسي في المتجر</p>
        </div>
        {saveButton}
      </header>

      {message && (
        <div className={`settings-message ${message.startsWith("✓") ? "success" : "error"}`}>
          {message}
        </div>
      )}

      <section className="settings-section">
        <div className="settings-section-title">
          <div><span>01</span><h2>بيانات المتجر</h2></div>
          <p>البيانات الأساسية التي تظهر للعملاء</p>
        </div>
        <div className="settings-grid">
          <label className="settings-field"><span>اسم المتجر</span><input value={settings.storeName} onChange={(e) => updateSetting("storeName", e.target.value)} /></label>
          <label className="settings-field"><span>الشعار النصي</span><input value={settings.tagline} onChange={(e) => updateSetting("tagline", e.target.value)} /></label>
          <label className="settings-field"><span>العملة</span><input value={settings.currency} onChange={(e) => updateSetting("currency", e.target.value)} /></label>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-title">
          <div><span>02</span><h2>الدفع والأسعار</h2></div>
          <p>التحكم في الحسابات التي يعتمد عليها الدفع</p>
        </div>
        <div className="settings-grid">
          <label className="settings-field"><span>مصاريف الشحن</span><input type="number" min="0" value={settings.shippingCost} onChange={(e) => updateSetting("shippingCost", Math.max(0, Number(e.target.value)))} /><small>EGP</small></label>
          <label className="settings-field"><span>نسبة العربون</span><input type="number" min="0" max="100" value={settings.depositPercent} onChange={(e) => updateSetting("depositPercent", Math.min(100, Math.max(0, Number(e.target.value))))} /><small>%</small></label>
          <label className="settings-field"><span>سعر الرسالة المخفية</span><input type="number" min="0" value={settings.hiddenMessagePrice} onChange={(e) => updateSetting("hiddenMessagePrice", Math.max(0, Number(e.target.value)))} /><small>EGP</small></label>
          <label className="settings-field"><span>الحد الأدنى للطلب</span><input type="number" min="0" value={settings.minimumOrderAmount} onChange={(e) => updateSetting("minimumOrderAmount", Math.max(0, Number(e.target.value)))} /><small>EGP — 0 = بدون حد</small></label>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-title">
          <div><span>03</span><h2>التواصل والسوشيال</h2></div>
          <p>الروابط وأرقام التواصل الخاصة بالمتجر</p>
        </div>
        <div className="settings-grid">
          <label className="settings-field"><span>WhatsApp</span><input placeholder="201xxxxxxxxx" value={settings.whatsapp} onChange={(e) => updateSetting("whatsapp", e.target.value)} /></label>
          <label className="settings-field"><span>Instagram</span><input placeholder="https://instagram.com/..." value={settings.instagram} onChange={(e) => updateSetting("instagram", e.target.value)} /></label>
          <label className="settings-field"><span>TikTok</span><input placeholder="https://tiktok.com/@..." value={settings.tiktok} onChange={(e) => updateSetting("tiktok", e.target.value)} /></label>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-title">
          <div><span>04</span><h2>مظهر الموقع</h2></div>
          <p>الألوان والخلفية والهوية البصرية للمتجر</p>
        </div>
        <div className="settings-grid">
          {([
            ["primaryColor", "Primary Color"],
            ["secondaryColor", "Secondary Color"],
            ["backgroundColor", "Background"],
            ["textColor", "Text Color"],
          ] as const).map(([key, label]) => (
            <label className="settings-field" key={key}>
              <span>{label}</span>
              <div className="color-input-row">
                <input type="color" value={settings[key]} onChange={(e) => updateSetting(key, e.target.value)} />
                <input value={settings[key]} onChange={(e) => updateSetting(key, e.target.value)} />
              </div>
            </label>
          ))}
          <label className="settings-field"><span>Logo URL</span><input placeholder="https://..." value={settings.logoUrl} onChange={(e) => updateSetting("logoUrl", e.target.value)} /></label>
          <label className="settings-field"><span>Favicon URL</span><input placeholder="https://..." value={settings.faviconUrl} onChange={(e) => updateSetting("faviconUrl", e.target.value)} /></label>
        </div>
      

      <section className="settings-section">
  <div className="settings-section-title">
    <div>
      <span>05B</span>
      <h2>التحكم في حجم البانر</h2>
    </div>
    <p>تحكم منفصل في عرض وارتفاع الفيديو على الكمبيوتر والموبايل</p>
  </div>

  <div className="settings-grid">
    <label className="settings-field">
      <span>عرض البانر على الكمبيوتر (%)</span>
      <input
        type="number"
        min="50"
        max="100"
        value={settings.bannerDesktopWidth}
        onChange={(e) =>
          updateSetting(
            "bannerDesktopWidth",
            Math.min(100, Math.max(50, Number(e.target.value) || 100))
          )
        }
      />
      <small>من 50% إلى 100%</small>
    </label>

    <label className="settings-field">
      <span>ارتفاع البانر على الكمبيوتر (بكسل)</span>
      <input
        type="number"
        min="150"
        max="900"
        step="10"
        value={settings.bannerDesktopHeight}
        onChange={(e) =>
          updateSetting(
            "bannerDesktopHeight",
            Math.min(900, Math.max(150, Number(e.target.value) || 420))
          )
        }
      />
      <small>من 150 إلى 900 بكسل</small>
    </label>

    <label className="settings-field">
      <span>عرض البانر على الموبايل (%)</span>
      <input
        type="number"
        min="50"
        max="100"
        value={settings.bannerMobileWidth}
        onChange={(e) =>
          updateSetting(
            "bannerMobileWidth",
            Math.min(100, Math.max(50, Number(e.target.value) || 100))
          )
        }
      />
      <small>من 50% إلى 100%</small>
    </label>

    <label className="settings-field">
      <span>ارتفاع البانر على الموبايل (بكسل)</span>
      <input
        type="number"
        min="120"
        max="700"
        step="10"
        value={settings.bannerMobileHeight}
        onChange={(e) =>
          updateSetting(
            "bannerMobileHeight",
            Math.min(700, Math.max(120, Number(e.target.value) || 240))
          )
        }
      />
      <small>من 120 إلى 700 بكسل</small>
    </label>
  </div>

  <div
    style={{
      marginTop: 20,
      padding: 16,
      borderRadius: 12,
      background: "#111",
      color: "#fff",
      border: "1px solid #333",
    }}
  >
    <p style={{ color: "#D4AF37", fontWeight: 700 }}>
      معاينة مباشرة للبانر
    </p>

    <div
      style={{
        width: "100%",
        overflow: "hidden",
        background: "#252525",
        borderRadius: 8,
        padding: 8,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: `${settings.bannerDesktopWidth}%`,
          height: `${Math.min(settings.bannerDesktopHeight, 500)}px`,
          margin: "0 auto",
          overflow: "hidden",
          border: "1px solid #D4AF37",
          borderRadius: 6,
          background: "#000",
          boxSizing: "border-box",
        }}
      >
        <video
          key="/ago-banner.mp4"
          src="/ago-banner.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    </div>

    <p style={{ color: "#bbb", fontSize: 13 }}>
      معاينة الكمبيوتر: {settings.bannerDesktopWidth}% عرض ×{" "}
      {settings.bannerDesktopHeight} بكسل ارتفاع
    </p>

    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: 8,
        background: "#252525",
        borderRadius: 8,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: `${settings.bannerMobileWidth}%`,
          maxWidth: 360,
          height: `${Math.min(settings.bannerMobileHeight, 450)}px`,
          overflow: "hidden",
          border: "1px solid #D4AF37",
          borderRadius: 6,
          background: "#000",
          boxSizing: "border-box",
        }}
      >
        <video
          key="/ago-banner.mp4-mobile"
          src="/ago-banner.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    </div>

    <p style={{ color: "#bbb", fontSize: 13 }}>
      معاينة الموبايل: {settings.bannerMobileWidth}% عرض ×{" "}
      {settings.bannerMobileHeight} بكسل ارتفاع
    </p>

    <small style={{ color: "#aaa" }}>
      المعاينة تتحدث فورًا. اضغط «حفظ جميع التغييرات» لحفظ المقاسات.
      الارتفاعات الكبيرة تُعرض بحد أقصى داخل المعاينة لتسهيل رؤية الصفحة.
    </small>
  </div>
</section>
        <div className="settings-grid">
          <label className="settings-field"><span>العنوان الرئيسي</span><input value={settings.heroTitle} onChange={(e) => updateSetting("heroTitle", e.target.value)} /></label>
          <label className="settings-field"><span>الوصف</span><input value={settings.heroSubtitle} onChange={(e) => updateSetting("heroSubtitle", e.target.value)} /></label>
          <label className="settings-field"><span>نص زر الشراء</span><input value={settings.heroButtonText} onChange={(e) => updateSetting("heroButtonText", e.target.value)} /></label>
          <label className="settings-field"><span>رابط زر الشراء</span><input value={settings.heroButtonLink} onChange={(e) => updateSetting("heroButtonLink", e.target.value)} /></label>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-title">
          <div><span>06</span><h2>رسائل الموقع</h2></div>
          <p>الرسائل التي تظهر للعملاء</p>
        </div>
        <div className="settings-grid">
          <label className="settings-field full"><span>Announcement</span><input placeholder="مثال: شحن مجاني لفترة محدودة" value={settings.announcementText} onChange={(e) => updateSetting("announcementText", e.target.value)} /></label>
          <label className="settings-field full"><span>Footer Text</span><input value={settings.footerText} onChange={(e) => updateSetting("footerText", e.target.value)} /></label>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-title">
          <div><span>07</span><h2>محرر شاشة البداية</h2></div>
          <p>تعديل شاشة الشعار السوداء والإضاءة الذهبية وزر الدخول</p>
        </div>

        <div className="settings-grid">
          <label className="settings-field">
            <span>نص زر الدخول</span>
            <input value={settings.landingButtonText} onChange={(e) => updateSetting("landingButtonText", e.target.value)} />
          </label>

          <label className="settings-field">
            <span>حجم دائرة الشعار (بكسل)</span>
            <input type="number" min="140" max="420" value={settings.landingCircleSize} onChange={(e) => updateSetting("landingCircleSize", Math.min(420, Math.max(140, Number(e.target.value) || 260)))} />
            <small>على الموبايل سيتم تصغيرها تلقائيًا إذا لزم الأمر</small>
          </label>

          <label className="settings-field">
            <span>مدة حركة فتح الشعار (مللي ثانية)</span>
            <input type="number" min="300" max="4000" step="100" value={settings.landingAnimationDuration} onChange={(e) => updateSetting("landingAnimationDuration", Math.min(4000, Math.max(300, Number(e.target.value) || 1200)))} />
          </label>

          <label className="settings-field">
            <span>قوة الإضاءة الذهبية</span>
            <input type="range" min="0" max="60" value={settings.landingGlowStrength} onChange={(e) => updateSetting("landingGlowStrength", Number(e.target.value))} />
            <small>{settings.landingGlowStrength}%</small>
          </label>

          <label className="settings-field">
            <span>لون خلفية شاشة البداية</span>
            <div className="color-input-row">
              <input type="color" value={settings.landingBackgroundColor} onChange={(e) => updateSetting("landingBackgroundColor", e.target.value)} />
              <input value={settings.landingBackgroundColor} onChange={(e) => updateSetting("landingBackgroundColor", e.target.value)} />
            </div>
          </label>

          <label className="settings-field">
            <span>لون الإضاءة وزر الدخول</span>
            <div className="color-input-row">
              <input type="color" value={settings.landingAccentColor} onChange={(e) => updateSetting("landingAccentColor", e.target.value)} />
              <input value={settings.landingAccentColor} onChange={(e) => updateSetting("landingAccentColor", e.target.value)} />
            </div>
          </label>

          <div className="settings-field full">
            <span>تغيير صورة لوجو شاشة البداية بدون Firebase Storage</span>
            <small>
              لتغيير اللوجو من غير تفعيل الفوترة: ضع الصورة الجديدة داخل مجلد public في مشروعك، وسمّها logo.png مع استبدال الصورة القديمة. احتفظ بنفس الاسم والمقاس المربع قدر الإمكان، ثم حدّث الصفحة.
            </small>
            <small>
              لو حابب تستخدم صورة مستضافة برابط مباشر، حط الرابط هنا واحفظ الإعدادات. اترك الحقل فارغًا لاستخدام /logo.png.
            </small>
            <label style={{ display: "block", marginTop: 12 }}>
              <span>رابط صورة مباشر (اختياري)</span>
              <input placeholder="https://... أو /logo.png" value={settings.landingLogoUrl} onChange={(e) => updateSetting("landingLogoUrl", e.target.value)} />
            </label>
            {settings.landingLogoUrl ? (
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <img src={settings.landingLogoUrl} alt="معاينة لوجو شاشة البداية" style={{ width: 100, height: 100, objectFit: "contain", background: settings.landingBackgroundColor, borderRadius: "50%", boxShadow: `0 0 ${Math.max(0, settings.landingGlowStrength)}px ${settings.landingAccentColor}66` }} />
                <button type="button" className="settings-save-btn" onClick={() => updateSetting("landingLogoUrl", "")}>استخدام اللوجو المحلي /logo.png</button>
              </div>
            ) : <small>حاليًا سيتم استخدام /logo.png من مجلد public.</small>}
          </div>
        </div>

        <div className="settings-switch-grid">
          <label className="settings-switch">
            <input type="checkbox" checked={settings.landingLightsEnabled} onChange={(e) => updateSetting("landingLightsEnabled", e.target.checked)} />
            <span>تشغيل الإضاءة المتحركة بالخلفية</span>
          </label>
        </div>

        <div className="settings-section-title" style={{ marginTop: 26 }}>
          <div><span>07B</span><h2>إعدادات الموبايل بشكل منفصل</h2></div>
          <p>القيم دي تتطبق على الشاشات بعرض 600px أو أقل، وإعدادات الكمبيوتر تفضل كما هي</p>
        </div>
        <div className="settings-grid">
          <label className="settings-field">
            <span>حجم اللوجو على الموبايل (بكسل)</span>
            <input type="number" min="120" max="320" value={settings.landingMobileCircleSize} onChange={(e) => updateSetting("landingMobileCircleSize", Math.min(320, Math.max(120, Number(e.target.value) || 220)))} />
          </label>
          <label className="settings-field">
            <span>سرعة فتح اللوجو على الموبايل (مللي ثانية)</span>
            <input type="number" min="300" max="4000" step="100" value={settings.landingMobileAnimationDuration} onChange={(e) => updateSetting("landingMobileAnimationDuration", Math.min(4000, Math.max(300, Number(e.target.value) || 1000)))} />
          </label>
          <label className="settings-field">
            <span>قوة الإضاءة على الموبايل</span>
            <input type="range" min="0" max="60" value={settings.landingMobileGlowStrength} onChange={(e) => updateSetting("landingMobileGlowStrength", Number(e.target.value))} />
            <small>{settings.landingMobileGlowStrength}%</small>
          </label>
          {([
            ["landingMobileBackgroundColor", "خلفية الموبايل"],
            ["landingMobileAccentColor", "لون الإضاءة والزر على الموبايل"],
          ] as const).map(([key, label]) => (
            <label className="settings-field" key={key}>
              <span>{label}</span>
              <div className="color-input-row">
                <input type="color" value={settings[key]} onChange={(e) => updateSetting(key, e.target.value)} />
                <input value={settings[key]} onChange={(e) => updateSetting(key, e.target.value)} />
              </div>
            </label>
          ))}
        </div>
        <div className="settings-switch-grid">
          <label className="settings-switch">
            <input type="checkbox" checked={settings.landingMobileLightsEnabled} onChange={(e) => updateSetting("landingMobileLightsEnabled", e.target.checked)} />
            <span>تشغيل الإضاءة المتحركة على الموبايل</span>
          </label>
        </div>

        <div style={{ marginTop: 20, padding: 18, borderRadius: 16, background: "#080808", color: "#fff", border: "1px solid #333" }}>
          <p style={{ marginTop: 0, color: "#bbb" }}>معاينة تقريبية للشكل الحالي</p>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "24px 10px", background: settings.landingBackgroundColor, borderRadius: 12 }}>
            <div style={{ width: Math.min(settings.landingCircleSize, 220), height: Math.min(settings.landingCircleSize, 220), borderRadius: "50%", background: "#050505", border: "1px solid #333", boxShadow: `0 0 ${Math.round(settings.landingGlowStrength * 1.5)}px ${settings.landingAccentColor}66`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 700 }}>
              {settings.landingLogoUrl ? <img src={settings.landingLogoUrl} alt="A.GO" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%" }} /> : "A.GO"}
            </div>
            <span style={{ background: settings.landingAccentColor, color: "#111", padding: "12px 28px", borderRadius: 999, fontWeight: 700 }}>
              {settings.landingButtonText || "ENTER STORE"}
            </span>
          </div>
          <small style={{ display: "block", marginTop: 10, color: "#aaa" }}>المعاينة توضيحية؛ الشاشة الفعلية تستخدم ملف الشعار الخاص بك.</small>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-title">
          <div><span>08</span><h2>خصائص الموقع</h2></div>
          <p>تشغيل وإيقاف خصائص المتجر</p>
        </div>
        <div className="settings-switch-grid">
          {([
            ["couponsEnabled", "الكوبونات"],
            ["hiddenMessagesEnabled", "الرسائل المخفية"],
            ["featuredProductsEnabled", "Featured Products"],
            ["cartEnabled", "سلة المشتريات"],
            ["checkoutEnabled", "صفحة الدفع"],
            ["shippingEnabled", "الشحن"],
          ] as const).map(([key, label]) => (
            <label className="settings-switch" key={key}>
              <input type="checkbox" checked={settings[key]} onChange={(e) => updateSetting(key, e.target.checked)} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-title">
          <div><span>09</span><h2>عرض المنتجات</h2></div>
          <p>التحكم في المعلومات التي تظهر للعميل</p>
        </div>
        <div className="settings-switch-grid">
          {([
            ["showProductColors", "إظهار الألوان"],
            ["showProductSizes", "إظهار المقاسات"],
            ["showProductStock", "إظهار المخزون"],
          ] as const).map(([key, label]) => (
            <label className="settings-switch" key={key}>
              <input type="checkbox" checked={settings[key]} onChange={(e) => updateSetting(key, e.target.checked)} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="settings-section danger-section">
        <div className="settings-section-title">
          <div><span>10</span><h2>حالة المتجر</h2></div>
          <p>التحكم في إتاحة المتجر للعملاء</p>
        </div>
        <div className="settings-switch-grid">
          <label className="settings-switch big"><input type="checkbox" checked={settings.storeActive} onChange={(e) => updateSetting("storeActive", e.target.checked)} /><span>المتجر يعمل</span></label>
          <label className="settings-switch big"><input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => updateSetting("maintenanceMode", e.target.checked)} /><span>وضع الصيانة</span></label>
        </div>
        <div className="settings-warning">
          <strong>تنبيه</strong>
          <p>تأكد من اختبار وضع الصيانة قبل تفعيله للزوار.</p>
        </div>
      </section>

      <div className="settings-bottom">{saveButton}</div>
    </main>
  );
}
