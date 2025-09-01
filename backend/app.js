require("dotenv").config();
const cors = require("cors");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const http = require("http");
const axios = require("axios");

const MONGO_URI = process.env.MONGO_URI;

const User = require("./models/userModel");
const VendorLocation = require("./models/vendorLocationModel");

const authRoutes = require("./routes/authRoute");
const webhookRoutes = require("./routes/webhookRoute");
const reviewRoutes = require("./routes/reviewRoute");
const otpRoutes = require("./routes/otpRoute");
const imageUploadRoutes = require("./routes/imageUploadRoute");

const allowedOrigins = [
  "https://laarikhojo.in",
  "http://localhost:3000",
  "https://www.laarikhojo.in",
  "http://localhost:5173",
  "http://localhost:5174",
];

// ---- helpers for phone normalization (Meta uses digits-only with country code) ----
const digitsOnly = (v) => String(v || "").replace(/\D/g, "");
const withCC = (msisdn) => (/^\d{10}$/.test(msisdn) ? "91" + msisdn : msisdn);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.some(
          (o) =>
            (typeof o === "string" && o === origin) ||
            (o instanceof RegExp && o.test(origin))
        )
      ) {
        callback(null, true);
      } else {
        console.log("Blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

// Keep raw body so webhookRoute can verify x-hub-signature-256 from Meta
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

// MongoDB Connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("App connected to database");
    app.listen(PORT, () => {
      console.log(`App listening to: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Add error handler
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.use("/api", authRoutes);
app.use("/api", webhookRoutes);
app.use("/api", reviewRoutes);
app.use("/api", otpRoutes);
app.use("/api", imageUploadRoutes);

app.get("/api/expand-url", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  try {
    const response = await axios.head(url, { maxRedirects: 5 });
    res.json({ expandedUrl: response.request.res.responseUrl });
  } catch (error) {
    console.error("Error expanding URL:", error);
    res.status(500).json({ error: "Failed to expand URL" });
  }
});

app.get("/api/all-users", async (req, res) => {
  try {
    const vendors = await User.find({})
      .limit(100)
      .sort({ updatedAt: -1 })
      .select("-password"); // Exclude password field for security

    // Get all vendor locations captured via WhatsApp
    const vendorLocations = await VendorLocation.find({});

    // Map normalized phone -> location data
    const locationMap = new Map();
    vendorLocations.forEach((loc) => {
      if (!loc || !loc.location) return;
      const key = withCC(digitsOnly(loc.phone));
      locationMap.set(key, {
        latitude: loc.location.lat,
        longitude: loc.location.lng,
        updatedAt: loc.updatedAt,
      });
    });

    // Merge WhatsApp location into vendor data
    const vendorsWithLocation = vendors.map((vendor) => {
      const vendorData = vendor.toObject();

      // Normalize vendor.contactNumber to match Meta format
      const vKey = withCC(digitsOnly(vendor.contactNumber));
      const locationData = locationMap.get(vKey);

      if (locationData) {
        vendorData.latitude = locationData.latitude;
        vendorData.longitude = locationData.longitude;
        vendorData.locationUpdatedAt = locationData.updatedAt;
        vendorData.locationSource = "whatsapp";
      } else if (vendor.mapsLink) {
        // Fallback: parse coordinates from mapsLink
        try {
          const mapsRegex = /@([-+]?\d*\.\d+),([-+]?\d*\.\d+)/;
          const match = vendor.mapsLink.match(mapsRegex);
          if (match) {
            vendorData.latitude = parseFloat(match[1]);
            vendorData.longitude = parseFloat(match[2]);
            vendorData.locationSource = "mapsLink";
          }
        } catch (error) {
          console.error(
            `Error parsing mapsLink for vendor ${vendor._id}:`,
            error
          );
        }
      }

      return vendorData;
    });

    res.json({ data: vendorsWithLocation });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
});

app.get("/", (req, res) => {
  res.status(200).send("Backend is live");
});

module.exports = app;
