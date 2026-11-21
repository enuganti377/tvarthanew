import { useEffect, useState } from "react";
import axios from "axios";

const COLORS = {
  primary: "#D7BDB0",
  background: "#F5EBE1",
  card: "#EDEEE9",
  text: "#292522",
  accent: "#795B4B",
  border: "#D8C6BA",
  muted: "#82766E",
  white: "#FFFFFF",
  danger: "#A94B42",
};

const districtMandals = {
  mulugu: ["Mulugu", "Eturnagaram"],
  jayashankar: ["Bhupalpally", "Ghanpur (Mulug)"],
};

// value must match the category the app sends in /feed?category=
const CATEGORIES = [
  { value: "politics", label: "Politics" },
  { value: "sports", label: "Sports" },
  { value: "cinema", label: "Cinema" },
  { value: "general", label: "General" },
];

const inputStyle = {
  width: "100%",
  padding: "14px 15px",
  marginTop: "8px",
  marginBottom: "20px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: "12px",
  fontSize: "16px",
  color: COLORS.text,
  background: COLORS.white,
  boxSizing: "border-box",
  outlineColor: COLORS.accent,
  fontFamily: "inherit",
};

const labelStyle = {
  display: "block",
  fontSize: "14px",
  fontWeight: "700",
  color: COLORS.text,
};

const cardStyle = {
  background: COLORS.white,
  border: `1px solid ${COLORS.border}`,
  borderRadius: "18px",
  padding: "24px",
  boxShadow: "0 5px 20px rgba(65,43,31,0.05)",
  boxSizing: "border-box",
  minWidth: 0,
};

function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [newsType, setNewsType] = useState("local"); // "local" | "category"
  const [location, setLocation] = useState("");
  const [mandal, setMandal] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [sendNotification, setSendNotification] = useState(true);
  const [loading, setLoading] = useState(false);

  // Image preview
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);

    return () => URL.revokeObjectURL(imageUrl);
  }, [file]);

  // Cloudinary image upload
  const uploadImage = async () => {
    const data = new FormData();

    data.append("file", file);
    data.append("upload_preset", "news_upload");

    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dprkhag0n/image/upload",
      data
    );

    return response.data.secure_url;
  };

  // Publish news
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newsType === "local" && (!location || !mandal)) {
      alert("Please select district and mandal");
      return;
    }

    if (newsType === "category" && !category) {
      alert("Please select a category");
      return;
    }

    if (!file) {
      alert("Please select a news image");
      return;
    }

    try {
      setLoading(true);

      const imageUrl = await uploadImage();

      const payload = {
        title,
        description,
        imageUrl,
        sendNotification,
        ...(newsType === "local"
          ? { location, mandal } // backend saves category = "general"
          : { category }), // backend saves location = "general", mandal = null
      };

      const response = await axios.post(
        "https://newrealme-backend.onrender.com/api/news/manual",
        payload
      );

      console.log(response.data);

      alert("News published successfully!");

      setTitle("");
      setDescription("");
      setLocation("");
      setMandal("");
      setCategory("");
      setFile(null);
      setSendNotification(true);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Error posting news"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: ${COLORS.background};
        }

        button, input, textarea, select { font-family: inherit; }

        .admin-page {
          min-height: 100vh;
          width: 100%;
          background: ${COLORS.background};
          padding: 32px 18px;
          overflow-x: hidden;
        }

        .admin-container { max-width: 1100px; width: 100%; margin: 0 auto; }

        .admin-header {
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 28px 20px;
          margin-bottom: 28px;
          background: ${COLORS.primary};
          border: 1px solid ${COLORS.border};
          border-radius: 22px;
          box-shadow: 0 5px 20px rgba(65,43,31,0.05);
        }

        .logo-container {
          width: 220px;
          height: 180px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: ${COLORS.white};
          border-radius: 25px;
          padding: 12px;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(65,43,31,0.10);
        }

        .admin-logo {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 18px;
        }

        .admin-badge {
          margin-top: 18px;
          background: ${COLORS.accent};
          color: ${COLORS.white};
          padding: 11px 25px;
          border-radius: 12px;
          font-weight: bold;
          font-size: 13px;
          letter-spacing: 0.5px;
        }

        .admin-subtitle {
          color: ${COLORS.accent};
          font-size: 13px;
          margin: 10px 0 0;
        }

        .page-title { font-size: 28px; color: ${COLORS.text}; }

        .editor-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(260px, 0.8fr);
          gap: 22px;
          align-items: start;
        }

        .settings-column { display: grid; gap: 22px; min-width: 0; }

        .admin-card { min-width: 0; overflow: hidden; }

        input:focus, textarea:focus, select:focus {
          outline: 2px solid ${COLORS.primary};
          border-color: ${COLORS.accent} !important;
        }

        .publish-button {
          width: 100%;
          padding: 17px;
          border: none;
          border-radius: 12px;
          background: ${COLORS.accent};
          color: white;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .publish-bar { margin-top: 22px; }

        .publish-button:hover { opacity: 0.9; }
        .publish-button:disabled { opacity: 0.6; cursor: not-allowed; }

        /* News type toggle */
        .type-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin: 10px 0 20px;
        }

        .type-btn {
          padding: 12px 8px;
          border: 1px solid ${COLORS.border};
          border-radius: 12px;
          background: ${COLORS.white};
          color: ${COLORS.text};
          font-weight: bold;
          font-size: 14px;
          cursor: pointer;
        }

        .type-btn.active {
          background: ${COLORS.accent};
          border-color: ${COLORS.accent};
          color: ${COLORS.white};
        }

        .upload-box {
          border: 2px dashed ${COLORS.primary};
          border-radius: 14px;
          padding: 22px 14px;
          background: ${COLORS.background};
          text-align: center;
        }

        .upload-box input { width: 100%; max-width: 100%; font-size: 13px; }

        .preview-image {
          width: 100%;
          max-height: 260px;
          object-fit: cover;
          border-radius: 13px;
          margin-top: 10px;
        }

        .remove-button {
          margin-top: 12px;
          padding: 11px 14px;
          border: none;
          border-radius: 9px;
          background: #F6E5E2;
          color: ${COLORS.danger};
          font-weight: bold;
          cursor: pointer;
        }

        .notification-box {
          background: ${COLORS.card};
          padding: 17px;
          border-radius: 13px;
          margin-bottom: 20px;
        }

        .notification-label {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 12px;
          font-size: 14px;
          color: ${COLORS.muted};
          line-height: 1.5;
          cursor: pointer;
        }

        .notification-label input {
          width: 19px;
          height: 19px;
          accent-color: ${COLORS.accent};
          flex-shrink: 0;
        }

        .admin-footer {
          text-align: center;
          padding: 28px 10px;
          color: ${COLORS.muted};
          font-size: 12px;
        }

        @media (max-width: 700px) {
          .admin-page { padding: 14px 12px 28px; }
          .admin-header { padding: 22px 14px; border-radius: 17px; margin-bottom: 22px; }
          .logo-container { width: 175px; height: 145px; border-radius: 20px; padding: 10px; }
          .admin-badge { margin-top: 15px; padding: 10px 22px; font-size: 12px; }
          .admin-subtitle { font-size: 12px; }
          .page-title { font-size: 23px; }
          .editor-grid { grid-template-columns: minmax(0, 1fr); gap: 16px; }
          .settings-column { gap: 16px; }
          .admin-card { padding: 17px !important; border-radius: 15px !important; }
          .admin-card h3 { font-size: 17px !important; }
          .upload-box { padding: 18px 10px; }
          .preview-image { max-height: 220px; }
          .admin-footer { padding: 22px 10px; }
        }

        /* Mobile polish */
        @media (max-width: 700px) {
          html { -webkit-text-size-adjust: 100%; }

          .admin-page { min-height: 100dvh; }

          /* 16px stops iOS from zooming into inputs; 48px = easy tap */
          input[type="text"], textarea, select {
            font-size: 16px !important;
            min-height: 48px;
            padding: 12px 13px !important;
            margin-bottom: 16px !important;
          }

          .type-btn { min-height: 48px; font-size: 15px; }

          .notification-label { align-items: center; min-height: 44px; }
          .notification-label input { width: 24px; height: 24px; }

          .upload-box input[type="file"] { font-size: 14px; padding: 8px 0; }

          .remove-button { width: 100%; min-height: 46px; }

          .publish-bar {
            position: sticky;
            bottom: 0;
            z-index: 20;
            margin: 16px -12px 0;
            padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
            background: ${COLORS.background};
            border-top: 1px solid ${COLORS.border};
            box-shadow: 0 -4px 14px rgba(65,43,31,0.08);
          }

          .publish-button { min-height: 52px; font-size: 17px; }

          .admin-footer { padding-bottom: 12px; }
        }

        @media (max-width: 380px) {
          .admin-page { padding: 10px 8px 22px; }
          .admin-card { padding: 14px !important; }
          .admin-header { padding: 20px 10px; }
          .logo-container { width: 155px; height: 130px; border-radius: 18px; }
          .page-title { font-size: 21px; }
          input, textarea, select { font-size: 16px !important; }
        }
      `}</style>

      <div className="admin-page">
        <div className="admin-container">
          {/* HEADER */}
          <header className="admin-header">
            <div className="logo-container">
              <img
                src="/t-vartha-logo.png"
                alt="T VARTHA Official Logo"
                className="admin-logo"
              />
            </div>

            <div className="admin-badge">ADMIN PANEL</div>

            <p className="admin-subtitle">Premium News Publishing Studio</p>
          </header>

          {/* PAGE HEADING */}
          <div style={{ marginBottom: "24px" }}>
            <p
              style={{
                color: COLORS.accent,
                fontSize: "12px",
                fontWeight: "bold",
                letterSpacing: "2px",
                marginBottom: "8px",
              }}
            >
              CONTENT MANAGEMENT
            </p>

            <h2 className="page-title" style={{ margin: 0 }}>
              Create a News Article
            </h2>

            <p
              style={{
                color: COLORS.muted,
                lineHeight: 1.5,
                marginTop: "8px",
              }}
            >
              Prepare and publish news to your T VARTHA application.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="editor-grid">
              {/* ARTICLE DETAILS */}
              <section className="admin-card" style={cardStyle}>
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: "22px",
                    fontSize: "19px",
                    color: COLORS.text,
                  }}
                >
                  Article Details
                </h3>

                <label style={labelStyle}>News Title *</label>

                <input
                  type="text"
                  placeholder="Enter Telugu news headline"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={inputStyle}
                />

                <label style={labelStyle}>News Description *</label>

                <textarea
                  placeholder="Write your complete news description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={7}
                  required
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    lineHeight: "1.7",
                  }}
                />

                {/* PUSH NOTIFICATION */}
                <div className="notification-box">
                  <label style={labelStyle}>Push Notification</label>

                  <label className="notification-label">
                    <input
                      type="checkbox"
                      checked={sendNotification}
                      onChange={(e) => setSendNotification(e.target.checked)}
                    />
                    <span>Send notification when news is published</span>
                  </label>
                </div>

              </section>

              {/* SETTINGS COLUMN */}
              <div className="settings-column">
                {/* NEWS TYPE + LOCATION / CATEGORY */}
                <section className="admin-card" style={cardStyle}>
                  <h3
                    style={{
                      marginTop: 0,
                      fontSize: "18px",
                      color: COLORS.text,
                    }}
                  >
                    News Type
                  </h3>

                  <div className="type-toggle">
                    <button
                      type="button"
                      className={`type-btn ${newsType === "local" ? "active" : ""}`}
                      onClick={() => {
                        setNewsType("local");
                        setCategory("");
                      }}
                    >
                       Local
                    </button>

                    <button
                      type="button"
                      className={`type-btn ${newsType === "category" ? "active" : ""}`}
                      onClick={() => {
                        setNewsType("category");
                        setLocation("");
                        setMandal("");
                      }}
                    >
                       Category
                    </button>
                  </div>

                  {newsType === "local" ? (
                    <>
                      <label style={labelStyle}>Select District *</label>

                      <select
                        value={location}
                        onChange={(e) => {
                          setLocation(e.target.value);
                          setMandal("");
                        }}
                        required
                        style={inputStyle}
                      >
                        <option value="">Choose District</option>
                        <option value="mulugu">Mulugu</option>
                        <option value="jayashankar">
                          Jayashankar Bhupalpally
                        </option>
                      </select>

                      <label style={labelStyle}>Select Mandal *</label>

                      <select
                        value={mandal}
                        onChange={(e) => setMandal(e.target.value)}
                        required
                        disabled={!location}
                        style={{
                          ...inputStyle,
                          marginBottom: 0,
                          opacity: location ? 1 : 0.6,
                          cursor: location ? "pointer" : "not-allowed",
                        }}
                      >
                        <option value="">Choose Mandal</option>

                        {location &&
                          districtMandals[location].map((item) => (
                            <option key={item} value={item.toLowerCase()}>
                              {item}
                            </option>
                          ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <label style={labelStyle}>Select Category *</label>

                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        style={{ ...inputStyle, marginBottom: 0 }}
                      >
                        <option value="">Choose Category</option>

                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </section>

                {/* FEATURED IMAGE */}
                <section className="admin-card" style={cardStyle}>
                  <h3
                    style={{
                      marginTop: 0,
                      fontSize: "18px",
                      color: COLORS.text,
                    }}
                  >
                     Featured Image
                  </h3>

                  <div className="upload-box">
                    <div style={{ fontSize: "32px" }}>📷</div>

                    <p style={{ fontWeight: "bold", color: COLORS.text }}>
                      Upload News Image
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      required={!file}
                    />

                    <p
                      style={{
                        color: COLORS.muted,
                        fontSize: "12px",
                        lineHeight: 1.5,
                      }}
                    >
                      Select an image from your device.
                    </p>
                  </div>

                  {preview && (
                    <div style={{ marginTop: "18px" }}>
                      <p style={labelStyle}>Image Preview</p>

                      <img
                        src={preview}
                        alt="News preview"
                        className="preview-image"
                      />

                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="remove-button"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </section>

                {/* PUBLISHING CHECKLIST */}
                <section
                  className="admin-card"
                  style={{ ...cardStyle, background: COLORS.card }}
                >
                  <p
                    style={{
                      color: COLORS.accent,
                      fontSize: "12px",
                      fontWeight: "bold",
                      letterSpacing: "1px",
                      marginTop: 0,
                    }}
                  >
                    PUBLISHING CHECKLIST
                  </p>

                  {[
                    "News title",
                    "News description",
                    newsType === "local"
                      ? "District and mandal"
                      : "News category",
                    "Featured image",
                  ].map((item) => (
                    <p
                      key={item}
                      style={{
                        fontSize: "13px",
                        margin: "12px 0",
                        color: COLORS.text,
                      }}
                    >
                      ✓ {item}
                    </p>
                  ))}
                </section>
              </div>
            </div>

            {/* PUBLISH BAR (sticks to the bottom on mobile) */}
            <div className="publish-bar">
              <button
                type="submit"
                disabled={loading}
                className="publish-button"
              >
                {loading ? "Publishing News..." : "Publish News →"}
              </button>
            </div>
          </form>

          {/* FOOTER */}
          <footer className="admin-footer">
            © T VARTHA · News Publishing Studio
          </footer>
        </div>
      </div>
    </>
  );
}

export default App;