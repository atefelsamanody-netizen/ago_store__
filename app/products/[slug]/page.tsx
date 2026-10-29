"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/app/lib/firebase";

type Color =
  | string
  | {
      name?: string;
      code?: string;
      images?: string[];
    };

type Product = {
  id: string;
  name?: string;
  slug?: string;
  price?: number;
  oldPrice?: number;
  stock?: number;
  images?: string[];
  sizes?: string[];
  colors?: Color[];
  hiddenMessages?: string[];
  hiddenMessagePrice?: number;
};

export default function ProductPage() {
  const params = useParams();

  const slug =
    typeof params?.slug === "string"
      ? params.slug
      : Array.isArray(params?.slug)
      ? params.slug[0]
      : "";

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColorImages, setSelectedColorImages] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(0);
  const [includeHiddenMessage, setIncludeHiddenMessage] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    function updateCartCount() {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCartCount(
          cart.reduce(
            (total: number, item: any) => total + (item.qty || 1),
            0
          )
        );
      } catch {
        setCartCount(0);
      }
    }

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  function isValidImageUrl(value: unknown): value is string {
    if (typeof value !== "string") return false;
    const url = value.trim();
    return (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("/")
    );
  }

  function cleanImages(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter(
      (item): item is string => isValidImageUrl(item)
    );
  }

  useEffect(() => {
    if (!slug) {
      setProduct(null);
      setError("Product URL is missing.");
      setLoading(false);
      return;
    }

    void loadProduct(slug);
  }, [slug]);

  async function loadProduct(routeValue: string) {
    setLoading(true);
    setError("");
    setProduct(null);

    try {
      let productData: Product | null = null;

      // 1. Search by slug.
      const productsRef = collection(db, "products");
      const slugQuery = query(
        productsRef,
        where("slug", "==", routeValue)
      );
      const slugSnapshot = await getDocs(slugQuery);

      if (!slugSnapshot.empty) {
        const productDoc = slugSnapshot.docs[0];
        productData = {
          ...productDoc.data(),
          id: productDoc.id,
        } as Product;
      }

      // 2. If slug search fails, try the Firebase document ID.
      if (!productData) {
        const productDoc = await getDoc(
          doc(db, "products", routeValue)
        );

        if (productDoc.exists()) {
          productData = {
            ...productDoc.data(),
            id: productDoc.id,
          } as Product;
        }
      }

      if (!productData) {
        setError(`Product "${routeValue}" was not found.`);
        return;
      }

      setProduct(productData);

      const generalImages = cleanImages(productData.images);
      const colors = Array.isArray(productData.colors)
        ? productData.colors
        : [];

      if (colors.length > 0) {
        const firstColor = colors[0];
        setSelectedColor(firstColor);

        const colorImages =
          typeof firstColor === "object" && firstColor !== null
            ? cleanImages(firstColor.images)
            : [];

        const initialImages =
          colorImages.length > 0 ? colorImages : generalImages;

        setSelectedColorImages(initialImages);
        setSelectedImageIndex(0);
        setSelectedImage(initialImages[0] || "");
      } else {
        setSelectedColor(null);
        setSelectedColorImages(generalImages);
        setSelectedImageIndex(0);
        setSelectedImage(generalImages[0] || "");
      }

      const sizes = Array.isArray(productData.sizes)
        ? productData.sizes
        : [];

      setSelectedSize(sizes[0] || "");
      setSelectedMessage(0);
      setIncludeHiddenMessage(false);
    } catch (err) {
      console.error("LOAD PRODUCT ERROR:", err);
      setProduct(null);
      setError("Could not load this product. Check Firebase permissions and connection.");
    } finally {
      setLoading(false);
    }
  }

  function handleColorChange(color: Color) {
    setSelectedColor(color);

    const generalImages = cleanImages(product?.images);
    const colorImages =
      typeof color === "object" && color !== null
        ? cleanImages(color.images)
        : [];

    const nextImages =
      colorImages.length > 0 ? colorImages : generalImages;

    setSelectedColorImages(nextImages);
    setSelectedImageIndex(0);
    setSelectedImage(nextImages[0] || "");
  }

  function showNextImage() {
    if (selectedColorImages.length <= 1) return;

    const nextIndex =
      (selectedImageIndex + 1) % selectedColorImages.length;

    setSelectedImageIndex(nextIndex);
    setSelectedImage(selectedColorImages[nextIndex]);
  }

  function showPreviousImage() {
    if (selectedColorImages.length <= 1) return;

    const previousIndex =
      selectedImageIndex === 0
        ? selectedColorImages.length - 1
        : selectedImageIndex - 1;

    setSelectedImageIndex(previousIndex);
    setSelectedImage(selectedColorImages[previousIndex]);
  }

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    setTouchStartX(e.touches[0].clientX);
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX === null) return;

    const difference = touchStartX - e.changedTouches[0].clientX;

    if (Math.abs(difference) > 50) {
      difference > 0 ? showNextImage() : showPreviousImage();
    }

    setTouchStartX(null);
  }

  function getColorName(color: Color, index: number) {
    if (typeof color === "string") return color;
    return color.name || `Color ${index + 1}`;
  }

  function getColorCode(color: Color) {
    if (typeof color === "string") {
      const normalized = color.trim();
      return /^#[0-9a-fA-F]{6}$/.test(normalized)
        ? normalized
        : "#000000";
    }

    return color.code || "#000000";
  }

  function isColorActive(color: Color) {
    if (typeof color === "string") {
      return selectedColor === color;
    }

    return (
      typeof selectedColor === "object" &&
      selectedColor !== null &&
      selectedColor.name === color.name
    );
  }

  if (loading) {
    return (
      <main className="product-page-shell">
        <header className="ago-page-nav product-page-nav">
          <a href="/track" className="ago-nav-track">◷ Track Order</a>
          <a href="/" className="ago-nav-logo">
            <span className="ago-nav-a">A</span>
            <span className="ago-nav-go">GO</span>
          </a>
          <a href="/cart" className="ago-nav-cart">
            🛒 Cart {cartCount > 0 ? `(${cartCount})` : ""}
          </a>
        </header>
        <div className="product-loading"><h2>Loading...</h2></div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-page-shell">
        <header className="ago-page-nav product-page-nav">
          <a href="/track" className="ago-nav-track">◷ Track Order</a>
          <a href="/" className="ago-nav-logo">
            <span className="ago-nav-a">A</span>
            <span className="ago-nav-go">GO</span>
          </a>
          <a href="/cart" className="ago-nav-cart">🛒 Cart</a>
        </header>
        <div className="product-error">
          <h2>Product Not Found</h2>
          <p>{error || `Product URL: ${slug}`}</p>
          <a href="/products">Back to products</a>
        </div>
      </main>
    );
  }

  const currentProduct = product;
  const images = cleanImages(currentProduct.images);
  const colors = Array.isArray(currentProduct.colors)
    ? currentProduct.colors
    : [];
  const sizes = Array.isArray(currentProduct.sizes)
    ? currentProduct.sizes
    : [];
  const hiddenMessages = Array.isArray(currentProduct.hiddenMessages)
    ? currentProduct.hiddenMessages.filter(
        (item): item is string => typeof item === "string"
      )
    : [];

  const currentHiddenMessage =
    hiddenMessages.length > 0
      ? hiddenMessages[selectedMessage]
      : null;

  const basePrice = Number(currentProduct.price || 0);
  const hiddenMessagePrice = Number(
    currentProduct.hiddenMessagePrice || 50
  );
  const finalPrice =
    basePrice + (includeHiddenMessage ? hiddenMessagePrice : 0);

  function addToCart() {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const hiddenMessage = includeHiddenMessage
        ? currentHiddenMessage
        : null;

      const colorKey =
        typeof selectedColor === "string"
          ? selectedColor
          : selectedColor?.name || "";

      const existingIndex = cart.findIndex(
        (item: any) =>
          (item.id === currentProduct.id || item.slug === slug) &&
          item.size === selectedSize &&
          (
            typeof item.color === "string"
              ? item.color
              : item.color?.name
          ) === colorKey &&
          item.hiddenMessage === hiddenMessage
      );

      if (existingIndex !== -1) {
        cart[existingIndex].qty =
          (cart[existingIndex].qty || 1) + 1;
      } else {
        cart.push({
          id: currentProduct.id,
          slug: currentProduct.slug || slug,
          name: currentProduct.name || "Product",
          image: selectedImage || images[0] || "/product-01.png",
          color: selectedColor,
          size: selectedSize,
          qty: 1,
          hiddenMessage,
          price: finalPrice,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("cartUpdated"));

      alert("✅ Product Added To Cart");
    } catch (err) {
      console.error("ADD TO CART ERROR:", err);
      alert("Could not add product to cart.");
    }
  }

  return (
    <main className="product-page-shell">
      <header className="ago-page-nav product-page-nav">
        <a href="/track" className="ago-nav-track" aria-label="Track Order">
          <span className="nav-track-icon">◷</span>
          <span>Track Order</span>
        </a>

        <a href="/" className="ago-nav-logo" aria-label="AGO Home">
          <span className="ago-nav-a">A</span>
          <span className="ago-nav-go">GO</span>
        </a>

        <a href="/cart" className="ago-nav-cart" aria-label="Shopping Cart">
          <span className="nav-cart-icon">🛒</span>
          <span>Cart {cartCount > 0 ? `(${cartCount})` : ""}</span>
        </a>
      </header>

      <section className="product-content">
        <div
          className="product-gallery"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {isValidImageUrl(selectedImage) ? (
            <img
              src={selectedImage}
              alt={currentProduct.name || "Product"}
              className="main-product-image"
              draggable={false}
            />
          ) : images.length > 0 ? (
            <img
              src={images[0]}
              alt={currentProduct.name || "Product"}
              className="main-product-image"
              draggable={false}
            />
          ) : (
            <div className="product-image-fallback"><span>AGO</span></div>
          )}

          {selectedColorImages.length > 1 && (
            <>
              <button
                type="button"
                className="gallery-arrow gallery-arrow-left"
                onClick={(e) => {
                  e.stopPropagation();
                  showPreviousImage();
                }}
                aria-label="Previous image"
              >
                ←
              </button>
              <button
                type="button"
                className="gallery-arrow gallery-arrow-right"
                onClick={(e) => {
                  e.stopPropagation();
                  showNextImage();
                }}
                aria-label="Next image"
              >
                →
              </button>
              <div className="image-counter">
                {selectedImageIndex + 1} / {selectedColorImages.length}
              </div>
            </>
          )}
        </div>

        <div className="product-info">
          <h1>{currentProduct.name || "Product"}</h1>

          <div className="price">
            <span className="new-price">{finalPrice} EGP</span>
            {Number(currentProduct.oldPrice || 0) > 0 && (
              <span className="old-price">
                {currentProduct.oldPrice} EGP
              </span>
            )}
          </div>

          {sizes.length > 0 && (
            <>
              <h3>Size</h3>
              <div className="sizes">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`size-btn ${selectedSize === size ? "active" : ""}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </>
          )}

          {colors.length > 0 && (
            <>
              <h3>Color</h3>
              <div className="colors">
                {colors.map((color, index) => {
                  const name = getColorName(color, index);
                  const code = getColorCode(color);

                  return (
                    <button
                      key={`${name}-${index}`}
                      type="button"
                      aria-label={name}
                      title={name}
                      className={`color ${isColorActive(color) ? "active" : ""}`}
                      style={{ "--swatch-color": code } as React.CSSProperties}
                      onClick={() => handleColorChange(color)}
                    />
                  );
                })}
              </div>
            </>
          )}

          {hiddenMessages.length > 0 && (
            <>
              <h3>Hidden Messages</h3>
              <button
                type="button"
                className={`select-message-btn ${includeHiddenMessage ? "active" : ""}`}
                onClick={() => setIncludeHiddenMessage((prev) => !prev)}
              >
                {includeHiddenMessage
                  ? "✔ Hidden Message Selected"
                  : `Add Hidden Message (+${hiddenMessagePrice} EGP)`}
              </button>

              {includeHiddenMessage && (
                <>
                  <div className="hidden-message-box">
                    <button
                      type="button"
                      className="arrow-btn"
                      onClick={() =>
                        setSelectedMessage((prev) =>
                          prev === 0 ? hiddenMessages.length - 1 : prev - 1
                        )
                      }
                    >
                      ←
                    </button>

                    {isValidImageUrl(currentHiddenMessage) && (
                      <div className="hidden-preview-wrapper">
                        <img
                          src={currentHiddenMessage}
                          alt="Hidden Message"
                          className="hidden-preview"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      className="arrow-btn"
                      onClick={() =>
                        setSelectedMessage((prev) =>
                          prev === hiddenMessages.length - 1 ? 0 : prev + 1
                        )
                      }
                    >
                      →
                    </button>
                  </div>

                  <p className="message-counter">
                    {selectedMessage + 1} / {hiddenMessages.length}
                  </p>
                </>
              )}
            </>
          )}

          <button
            type="button"
            className="add-cart-btn"
            onClick={addToCart}
          >
            Add To Cart
          </button>
        </div>
      </section>
    </main>
  );
}