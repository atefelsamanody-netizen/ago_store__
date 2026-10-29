"use client";

import { useState, type Dispatch, type SetStateAction } from "react";

type ColorItem = {
  name: string;
  code: string;
  images: string[];
};

type Props = {
  colors: ColorItem[];
  setColors: Dispatch<SetStateAction<ColorItem[]>>;
  images: string[];
};

const presetColors = [
  { name: "Black", code: "#000000" },
  { name: "White", code: "#FFFFFF" },
  { name: "Navy", code: "#172554" },
  { name: "Baby Blue", code: "#89CFF0" },
  { name: "Iron Grey", code: "#43464B" },
  { name: "Light Grey", code: "#D3D3D3" },
  { name: "Gray", code: "#808080" },
  { name: "Burgundy", code: "#800020" },
  { name: "Olive", code: "#556B2F" },
  { name: "Beige", code: "#D8C3A5" },
  { name: "Pink", code: "#FFC0CB" },
  { name: "Red", code: "#D71920" },
  { name: "Brown", code: "#795548" },
  { name: "Cream", code: "#FFF1D0" },
];

export default function ProductColors({
  colors,
  setColors,
  images,
}: Props) {
  const [customName, setCustomName] = useState("");
  const [customCode, setCustomCode] = useState("#89CFF0");

  function normalizeCode(code: string) {
    return code.trim().toUpperCase();
  }

  function addColor(color: {
    name: string;
    code: string;
  }) {
    const exists = colors.some(
      (item) =>
        item.name.toLowerCase() === color.name.toLowerCase() ||
        normalizeCode(item.code) === normalizeCode(color.code)
    );

    if (exists) {
      return;
    }

    setColors((prev) => [
      ...prev,
      {
        name: color.name,
        code: color.code,
        images: [],
      },
    ]);
  }

  function addCustomColor() {
    const name = customName.trim();

    if (!name) {
      alert("اكتب اسم اللون الأول.");
      return;
    }

    if (
      colors.some(
        (item) =>
          item.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      alert("اللون ده مضاف بالفعل.");
      return;
    }

    addColor({
      name,
      code: customCode,
    });

    setCustomName("");
  }

  function removeColor(index: number) {
    setColors((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  function toggleImage(colorIndex: number, image: string) {
    setColors((prev) =>
      prev.map((color, i) => {
        if (i !== colorIndex) return color;

        const exists = color.images.includes(image);

        return {
          ...color,
          images: exists
            ? color.images.filter((img) => img !== image)
            : [...color.images, image],
        };
      })
    );
  }

  function isSelected(color: { name: string; code: string }) {
    return colors.some(
      (item) =>
        item.name.toLowerCase() === color.name.toLowerCase() ||
        normalizeCode(item.code) === normalizeCode(color.code)
    );
  }

  function getContrastColor(code: string) {
    const hex = code.replace("#", "");

    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
      return "#111111";
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 155 ? "#111111" : "#FFFFFF";
  }

  return (
    <div
      style={{
        marginTop: 25,
        padding: 20,
        border: "1px solid #D8D8D8",
        borderRadius: 16,
        background: "#FAFAFA",
        color: "#111111",
      }}
    >
      <h3
        style={{
          margin: "0 0 8px",
          fontSize: 19,
          fontWeight: 800,
        }}
      >
        Product Colors / ألوان المنتج
      </h3>

      <p
        style={{
          margin: "0 0 18px",
          color: "#666666",
          fontSize: 13,
          lineHeight: 1.7,
        }}
      >
        اختار الألوان المتاحة للموديل. اضغط على اللون لإضافته،
        واضغط عليه مرة أخرى لإزالته.
      </p>

      {/* PRESET COLORS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {presetColors.map((color) => {
          const selected = isSelected(color);

          return (
            <button
              key={color.name}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                if (selected) {
                  setColors((prev) =>
                    prev.filter(
                      (item) =>
                        item.name.toLowerCase() !==
                          color.name.toLowerCase() &&
                        normalizeCode(item.code) !==
                          normalizeCode(color.code)
                    )
                  );
                } else {
                  addColor(color);
                }
              }}
              title={`${color.name}${selected ? " - Selected" : ""}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 7,
                padding: "10px 5px",
                minWidth: 0,
                border: selected
                  ? "2px solid #D4AF37"
                  : "1px solid #E0E0E0",
                borderRadius: 12,
                background: selected ? "#FFF9E7" : "#FFFFFF",
                cursor: "pointer",
                boxShadow: selected
                  ? "0 0 0 2px rgba(212,175,55,0.18)"
                  : "none",
              }}
            >
              <span
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 43,
                  height: 43,
                  flexShrink: 0,
                  borderRadius: "50%",
                  background: color.code,
                  border:
                    color.code.toUpperCase() === "#FFFFFF" ||
                    color.code.toUpperCase() === "#FFF1D0" ||
                    color.code.toUpperCase() === "#D3D3D3"
                      ? "2px solid #A0A0A0"
                      : "2px solid rgba(0,0,0,0.14)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                  color: getContrastColor(color.code),
                }}
              >
                {selected && (
                  <span
                    style={{
                      fontSize: 23,
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    ✓
                  </span>
                )}
              </span>

              <span
                style={{
                  fontSize: 11,
                  fontWeight: selected ? 800 : 600,
                  textAlign: "center",
                  lineHeight: 1.35,
                  overflowWrap: "anywhere",
                  color: "#222222",
                }}
              >
                {color.name}
              </span>

              <span
                style={{
                  fontSize: 10,
                  color: selected ? "#8A6810" : "#888888",
                  fontWeight: 700,
                }}
              >
                {selected ? "SELECTED" : "ADD COLOR"}
              </span>
            </button>
          );
        })}
      </div>

      {/* CUSTOM COLOR */}

      <div
        style={{
          padding: 15,
          border: "1px solid #E0E0E0",
          borderRadius: 12,
          background: "#FFFFFF",
        }}
      >
        <h4 style={{ margin: "0 0 12px", fontSize: 15 }}>
          Add Custom Color / إضافة لون جديد
        </h4>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <input
            type="color"
            aria-label="Choose custom color"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            style={{
              width: 54,
              height: 48,
              padding: 3,
              border: "1px solid #CCCCCC",
              borderRadius: 10,
              background: "#FFFFFF",
              cursor: "pointer",
            }}
          />

          <div
            style={{
              display: "flex",
              flex: "1 1 180px",
              flexDirection: "column",
              gap: 5,
            }}
          >
            <label
              htmlFor="custom-color-name"
              style={{ fontSize: 12, fontWeight: 700 }}
            >
              Color name / اسم اللون
            </label>

            <input
              id="custom-color-name"
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomColor();
                }
              }}
              placeholder="مثال: Charcoal Grey"
              style={{
                width: "100%",
                height: 42,
                padding: "0 12px",
                border: "1px solid #CCCCCC",
                borderRadius: 9,
                color: "#111111",
                background: "#FFFFFF",
                outlineColor: "#D4AF37",
              }}
            />
          </div>

          <button
            type="button"
            onClick={addCustomColor}
            style={{
              minHeight: 42,
              padding: "0 16px",
              border: "none",
              borderRadius: 9,
              background: "#D4AF37",
              color: "#FFFFFF",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            + Add Color
          </button>
        </div>

        <p style={{ margin: "10px 0 0", color: "#777777", fontSize: 12 }}>
          اللون المخصص يُضاف لهذا المنتج. إضافته هنا لا تجعله لونًا عامًا
          محفوظًا تلقائيًا لكل المنتجات.
        </p>
      </div>

      {/* SELECTED COLORS */}

      <div
        style={{
          marginTop: 24,
          paddingTop: 18,
          borderTop: "1px solid #E0E0E0",
        }}
      >
        <h4 style={{ margin: "0 0 14px", fontSize: 16 }}>
          Selected Colors / الألوان المختارة ({colors.length})
        </h4>

        {colors.length === 0 ? (
          <p style={{ color: "#777777", fontSize: 13 }}>
            No colors selected / لم يتم اختيار ألوان بعد.
          </p>
        ) : (
          colors.map((color, index) => (
            <div
              key={`${color.name}-${color.code}-${index}`}
              style={{
                position: "relative",
                padding: 15,
                marginBottom: 12,
                border: "1px solid #DDDDDD",
                borderRadius: 12,
                background: "#FFFFFF",
              }}
            >
              <button
                type="button"
                aria-label={`Remove ${color.name}`}
                onClick={() => removeColor(index)}
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  border: "none",
                  background: "#FCE7E7",
                  color: "#B42318",
                  cursor: "pointer",
                  fontSize: 20,
                  fontWeight: 800,
                }}
              >
                ×
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 15,
                  paddingRight: 30,
                }}
              >
                <span
                  style={{
                    width: 48,
                    height: 48,
                    flexShrink: 0,
                    borderRadius: "50%",
                    background: color.code,
                    border: "2px solid #BDBDBD",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                  }}
                />

                <div>
                  <strong style={{ display: "block", fontSize: 15 }}>
                    {color.name}
                  </strong>
                  <span style={{ color: "#777777", fontSize: 12 }}>
                    {color.code.toUpperCase()}
                  </span>
                </div>
              </div>

              <label
                style={{
                  display: "block",
                  color: "#222222",
                  fontWeight: 700,
                  fontSize: 13,
                  marginBottom: 10,
                }}
              >
                Images for {color.name} / صور اللون
              </label>

              {images.length === 0 ? (
                <p style={{ color: "#888888", fontSize: 12 }}>
                  ارفع صور المنتج أولًا لو عايز تربط صورًا معينة باللون ده.
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(78px, 1fr))",
                    gap: 10,
                  }}
                >
                  {images.map((image, imageIndex) => {
                    const selected = color.images.includes(image);

                    return (
                      <button
                        key={`${image}-${imageIndex}`}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleImage(index, image)}
                        title={
                          selected
                            ? "Remove image from this color"
                            : "Assign image to this color"
                        }
                        style={{
                          position: "relative",
                          padding: 3,
                          border: selected
                            ? "3px solid #D4AF37"
                            : "1px solid #DDDDDD",
                          borderRadius: 10,
                          background: "#FFFFFF",
                          cursor: "pointer",
                          minWidth: 0,
                        }}
                      >
                        <img
                          src={image}
                          alt={`${color.name} product image ${imageIndex + 1}`}
                          style={{
                            width: "100%",
                            height: 85,
                            objectFit: "cover",
                            borderRadius: 6,
                            display: "block",
                          }}
                        />

                        {selected && (
                          <span
                            style={{
                              position: "absolute",
                              top: 5,
                              right: 5,
                              width: 23,
                              height: 23,
                              borderRadius: "50%",
                              background: "#D4AF37",
                              color: "#FFFFFF",
                              fontSize: 15,
                              fontWeight: 900,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <p
                style={{
                  color: "#777777",
                  fontSize: 12,
                  margin: "12px 0 0",
                }}
              >
                Selected images: {color.images.length}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}