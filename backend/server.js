import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend integration
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Base API Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/history", historyRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Jatayuv AI Backend Service",
    timestamp: new Date().toISOString(),
  });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend working"
  });
});

// 404 Handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found.",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Backend Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Jatayuv AI Backend Server running on http://localhost:${PORT}`);
});

export default app;
