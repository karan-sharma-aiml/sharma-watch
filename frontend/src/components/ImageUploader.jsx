import React, { useState, useRef, useCallback } from "react";
import { FiUpload, FiX, FiStar, FiImage, FiTrash2 } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

export default function ImageUploader({
  images = [],
  onChange,
  maxImages = 5,
}) {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  const uploadFiles = async (files) => {
    // ── DEBUG: What did file picker return? ───────────
    console.log("=== IMAGE UPLOAD DEBUG ===");
    console.log("files object:", files);
    console.log("files type:", typeof files);
    console.log("files.length:", files?.length);

    if (!files || files.length === 0) {
      console.log("❌ No files passed to uploadFiles");
      addToast("No files selected.", "error");
      return;
    }

    const filesArray = Array.from(files);
    console.log("filesArray:", filesArray);
    console.log("filesArray.length:", filesArray.length);

    filesArray.forEach((f, i) => {
      console.log(`File[${i}]:`, {
        name: f.name,
        size: f.size,
        type: f.mimetype || f.type,
        lastModified: f.lastModified,
      });
    });

    // ── Validate ───────────────────────────────────────
    const VALID_TYPES = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    const validFiles = filesArray.filter((f) => {
      const fileType = f.type || f.mimetype || "";
      console.log(`Checking type for ${f.name}:`, fileType);

      if (!VALID_TYPES.includes(fileType.toLowerCase())) {
        console.log(`❌ Rejected type: ${fileType}`);
        addToast(`${f.name} — Only JPG, PNG, WebP allowed.`, "error");
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        console.log(`❌ File too large: ${f.size} bytes`);
        addToast(`${f.name} — Max 5MB per image.`, "error");
        return false;
      }
      console.log(`✅ File valid: ${f.name}`);
      return true;
    });

    console.log("Valid files after filter:", validFiles.length);

    const remaining = maxImages - images.length;
    if (validFiles.length === 0) {
      console.log("❌ No valid files after filtering");
      return;
    }

    if (validFiles.length > remaining) {
      addToast(`Only ${remaining} more image(s) allowed.`, "warning");
      validFiles.splice(remaining);
    }

    setUploading(true);

    try {
      // ── Build FormData ─────────────────────────────
      const formData = new FormData();
      validFiles.forEach((f, i) => {
        formData.append("images", f);
        console.log(`Appended to FormData[${i}]:`, f.name, f.type, f.size);
      });

      // ── DEBUG: Inspect FormData ────────────────────
      console.log("=== FormData Contents ===");
      for (const pair of formData.entries()) {
        console.log("Key:", pair[0], "| Value:", pair[1]);
      }

      // ── Check token ────────────────────────────────
      const token = localStorage.getItem("token");
      console.log("Token present:", !!token);
      console.log("Token preview:", token?.substring(0, 30) + "...");

      // ── Send request ───────────────────────────────
      // DO NOT set Content-Type — let browser set it with boundary
      console.log("Sending POST /upload/images ...");

      const { data } = await api.post("/upload/images", formData);

      console.log("✅ Upload response:", data);

      const newImages = data.data.images.map((img, i) => ({
        url: img.url,
        publicId: img.publicId,
        alt: "",
        isMain: images.length === 0 && i === 0,
        order: images.length + i,
      }));

      const updated = [...images, ...newImages];
      if (!updated.some((img) => img.isMain) && updated.length > 0) {
        updated[0].isMain = true;
      }
      onChange(updated);
      addToast(`${newImages.length} image(s) uploaded!`, "success");
    } catch (err) {
      console.error("❌ Upload failed:", {
        status: err.response?.status,
        message: err.response?.data?.message,
        data: err.response?.data,
      });

      if (err.response?.status === 401) {
        addToast("Session expired. Please login again.", "error");
      } else if (err.response?.status === 403) {
        addToast("Admin access required.", "error");
      } else {
        addToast(err.response?.data?.message || "Upload failed.", "error");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      uploadFiles(e.dataTransfer.files);
    },
    [images],
  );

  const handleFileInput = (e) => {
    console.log("=== FILE INPUT CHANGE ===");
    console.log("e.target.files:", e.target.files);
    console.log("e.target.files.length:", e.target.files?.length);

    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
    } else {
      console.log("❌ No files in input event");
    }
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const setMainImage = (index) => {
    const updated = images.map((img, i) => ({ ...img, isMain: i === index }));
    onChange(updated);
  };

  const removeImage = async (index) => {
    const img = images[index];
    try {
      if (img.publicId) {
        await api.delete("/upload/image", { data: { publicId: img.publicId } });
      }
    } catch {
      /* silent — still remove from UI */
    }
    const updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((i) => i.isMain)) {
      updated[0].isMain = true;
    }
    onChange(updated);
    addToast("Image removed.", "info");
  };

  // Drag to reorder
  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverImage = (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const updated = [...images];
    const dragged = updated.splice(dragIndex, 1)[0];
    updated.splice(index, 0, dragged);
    updated.forEach((img, i) => {
      img.order = i;
    });
    setDragIndex(index);
    onChange(updated);
  };

  const handleDragEnd = () => setDragIndex(null);

  return (
    <div>
      {/* Upload Zone */}
      {images.length < maxImages && (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          style={{
            border: `2px dashed ${dragOver ? "#d4af37" : "#333"}`,
            borderRadius: 16,
            padding: "32px 20px",
            textAlign: "center",
            cursor: uploading ? "not-allowed" : "pointer",
            background: dragOver
              ? "rgba(212,175,55,0.05)"
              : "rgba(255,255,255,0.02)",
            transition: "all 0.2s",
            marginBottom: 16,
          }}
        >
          {uploading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "3px solid #333",
                  borderTopColor: "#d4af37",
                  animation: "spin 1s linear infinite",
                }}
              />
              <p style={{ color: "#888", fontSize: 13 }}>
                Uploading to Cloudinary…
              </p>
            </div>
          ) : (
            <>
              <FiUpload
                size={28}
                color={dragOver ? "#d4af37" : "#555"}
                style={{ marginBottom: 10 }}
              />
              <p style={{ color: "#ccc", fontSize: 13, fontWeight: 600 }}>
                Drag & Drop images here
              </p>
              <p style={{ color: "#666", fontSize: 11, marginTop: 4 }}>
                or click to browse — JPG, PNG, WebP — Max 5MB each
              </p>
              <p style={{ color: "#d4af37", fontSize: 11, marginTop: 6 }}>
                {images.length}/{maxImages} images — {maxImages - images.length}{" "}
                remaining
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleFileInput}
        style={{ display: "none" }}
      />

      {/* Image Grid */}
      {images.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: 10,
          }}
        >
          {images.map((img, index) => (
            <div
              key={img.publicId || index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOverImage(e, index)}
              onDragEnd={handleDragEnd}
              style={{
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                border: img.isMain ? "2px solid #d4af37" : "2px solid #2a2a2a",
                aspectRatio: "1",
                background: "#111",
                cursor: "grab",
                transition: "all 0.2s",
                opacity: dragIndex === index ? 0.5 : 1,
              }}
            >
              <img
                src={img.url}
                alt={img.alt || `Product ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              {/* Main badge */}
              {img.isMain && (
                <div
                  style={{
                    position: "absolute",
                    top: 6,
                    left: 6,
                    background: "#d4af37",
                    color: "#000",
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <FiStar size={8} /> MAIN
                </div>
              )}

              {/* Drag handle */}
              <div
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  color: "#fff",
                  opacity: 0.6,
                }}
              >
                <MdDragIndicator size={14} />
              </div>

              {/* Actions */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  display: "flex",
                  gap: 2,
                  padding: 4,
                  background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                }}
              >
                {!img.isMain && (
                  <button
                    type="button"
                    onClick={() => setMainImage(index)}
                    title="Set as main"
                    style={{
                      flex: 1,
                      background: "rgba(212,175,55,0.2)",
                      border: "1px solid rgba(212,175,55,0.4)",
                      borderRadius: 6,
                      padding: "3px 0",
                      color: "#d4af37",
                      fontSize: 9,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Main
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  title="Remove"
                  style={{
                    width: 24,
                    height: 24,
                    background: "rgba(220,50,50,0.3)",
                    border: "1px solid rgba(220,50,50,0.4)",
                    borderRadius: 6,
                    color: "#ff6b6b",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FiX size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <p
          style={{
            color: "#666",
            fontSize: 11,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          * At least 1 image is required
        </p>
      )}
    </div>
  );
}
