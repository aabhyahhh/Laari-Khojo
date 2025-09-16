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
const adminRoutes = require("./routes/adminRoute");
const vendorClickRoutes = require("./routes/vendorClickRoute");

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

// Ensure raw body is available for webhook signature verification
app.use((req, res, next) => {
  if (req.rawBody) {
    next();
  } else {
    // For routes that need raw body but don't have it
    req.rawBody = Buffer.from(JSON.stringify(req.body || {}));
    next();
  }
});

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
app.use("/api/admin", adminRoutes);
app.use("/api/vendor-clicks", vendorClickRoutes);

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

// --- Enhanced /api/all-users endpoint ---
app.get("/api/all-users", async (req, res) => {
  try {
    const vendors = await User.find({})
      .limit(100)
      .sort({ updatedAt: -1 })
      .select("-password");

    // Get all vendor locations captured via WhatsApp
    const vendorLocations = await VendorLocation.find({});

    // Create a set of current vendor phones for validation
    const currentVendorPhones = new Set();
    vendors.forEach(vendor => {
      if (vendor.contactNumber) {
        const phone = vendor.contactNumber;
        currentVendorPhones.add(phone);
        currentVendorPhones.add(withCC(digitsOnly(phone)));
        currentVendorPhones.add(digitsOnly(phone));
      }
    });

    // Map normalized phone -> location data (only for existing vendors)
    const locationMap = new Map();
    vendorLocations.forEach((loc) => {
      if (!loc || !loc.location) return;
      const locationPhone = loc.phone;
      const normalizedLocationPhone = withCC(digitsOnly(locationPhone));
      const digitsOnlyPhone = digitsOnly(locationPhone);
      // Only include location data if there's a corresponding vendor
      if (
        currentVendorPhones.has(locationPhone) ||
        currentVendorPhones.has(normalizedLocationPhone) ||
        currentVendorPhones.has(digitsOnlyPhone)
      ) {
        const key = normalizedLocationPhone;
        locationMap.set(key, {
          latitude: loc.location.lat,
          longitude: loc.location.lng,
          updatedAt: loc.updatedAt,
        });
      }
    });

    // Merge WhatsApp location into vendor data
    const vendorsWithLocation = vendors.map((vendor) => {
      const vendorData = vendor.toObject();
      // Normalize vendor.contactNumber to match Meta format
      const vKey = withCC(digitsOnly(vendor.contactNumber));
      const locationData = locationMap.get(vKey);
      // Only attach WhatsApp location if it was updated after vendor registration
      const vendorCreatedAt = vendorData.updatedAt || vendorData.createdAt;
      if (
        locationData &&
        locationData.updatedAt &&
        vendorCreatedAt &&
        new Date(locationData.updatedAt) > new Date(vendorCreatedAt)
      ) {
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

// --- Cleanup endpoint for orphaned VendorLocation entries ---
app.post('/api/admin/cleanup-orphaned-locations', async (req, res) => {
  try {
    // Get all vendor phone numbers from User collection
    const vendors = await User.find({}, { contactNumber: 1 });
    const vendorPhones = new Set();
    vendors.forEach(vendor => {
      if (vendor.contactNumber) {
        const phone = vendor.contactNumber;
        vendorPhones.add(phone);
        vendorPhones.add(withCC(digitsOnly(phone)));
        vendorPhones.add(digitsOnly(phone));
      }
    });
    // Find VendorLocation entries that don't have corresponding vendors
    const allLocations = await VendorLocation.find({});
    const orphanedLocationIds = [];
    allLocations.forEach(location => {
      const locationPhone = location.phone;
      const normalizedLocationPhone = withCC(digitsOnly(locationPhone));
      const digitsOnlyPhone = digitsOnly(locationPhone);
      if (
        !vendorPhones.has(locationPhone) &&
        !vendorPhones.has(normalizedLocationPhone) &&
        !vendorPhones.has(digitsOnlyPhone)
      ) {
        orphanedLocationIds.push(location._id);
      }
    });
    // Delete orphaned location entries
    if (orphanedLocationIds.length > 0) {
      const result = await VendorLocation.deleteMany({
        _id: { $in: orphanedLocationIds }
      });
      console.log(`Cleaned up ${result.deletedCount} orphaned location entries`);
      res.json({
        success: true,
        message: `Cleaned up ${result.deletedCount} orphaned location entries`,
        deletedCount: result.deletedCount
      });
    } else {
      res.json({
        success: true,
        message: 'No orphaned location entries found',
        deletedCount: 0
      });
    }
  } catch (error) {
    console.error('Error cleaning up orphaned locations:', error);
    res.status(500).json({ error: 'Failed to cleanup orphaned locations' });
  }
});

app.get("/", (req, res) => {
  res.status(200).send("Backend is live");
});

// --- Meta WhatsApp test endpoints (safe to remove later) ---

// Send a free-form text (works only if the user wrote to you in the last 24h)
app.get("/api/test/send-text", async (req, res) => {
  try {
    const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || "v21.0";
    const TOKEN = process.env.WHATSAPP_TOKEN;
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!TOKEN || !PHONE_NUMBER_ID) {
      return res.status(500).json({ error: "Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID" });
    }

    const toRaw = String(req.query.to || "");
    const to = withCC(digitsOnly(toRaw)); // ensure digits + country code (e.g., 91xxxxxxxxxx)
    const body = String(req.query.body || "Hello from Laari Khojo!");

    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`;
    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body }
    };

    const r = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    return res.json(r.data);
  } catch (err) {
    // Common cause: outside 24h window -> need a template instead
    const data = err.response?.data || { message: err.message };
    return res.status(err.response?.status || 500).json({ error: "Send text failed", details: data });
  }
});

// Send a template (works inside/outside 24h, as long as it's approved)
app.get("/api/test/send-template", async (req, res) => {
  try {
    const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || "v21.0";
    const TOKEN = process.env.WHATSAPP_TOKEN;
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!TOKEN || !PHONE_NUMBER_ID) {
      return res.status(500).json({ error: "Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID" });
    }

    const toRaw = String(req.query.to || "");
    const templateName = String(req.query.name || "your_template_name");
    const to = withCC(digitsOnly(toRaw));

    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`;
    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en" }
        // add components here if your template expects variables
        // components: [{ type: "body", parameters: [{ type: "text", text: "Riya" }] }]
      }
    };

    const r = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    return res.json(r.data);
  } catch (err) {
    const data = err.response?.data || { message: err.message };
    return res.status(err.response?.status || 500).json({ error: "Send template failed", details: data });
  }
});

module.exports = app;
