const express = require("express");
const router = express.Router();
const {
  registerSeller,
  editSellerProfile,
  deleteSellerProfile,
  getSellerStorefront,
  getSellerDashboard,
  getPendingSellers,
  getApprovedSellers,
  approveSeller,
  rejectSeller,
  requestReapproval,
  deleteSellerByAdmin,
} = require("../controllers/sellerController");

const { protect, admin, sellerOnly } = require("../middleware/authMiddleware");

// Public Routes
router.get("/store/:id", getSellerStorefront);

// Seller Protected Routes
router.post("/register", protect, registerSeller);
router.put("/profile", protect, sellerOnly, editSellerProfile);
router.delete("/profile", protect, sellerOnly, deleteSellerProfile);
router.get("/dashboard", protect, sellerOnly, getSellerDashboard);
router.post("/request-reapproval", protect, sellerOnly, requestReapproval);

// Admin Routes
router.get("/admin/pending", protect, admin, getPendingSellers);
router.get("/admin/approved", protect, admin, getApprovedSellers);
router.put("/admin/approve/:id", protect, admin, approveSeller);
router.put("/admin/reject/:id", protect, admin, rejectSeller);
router.delete("/admin/delete/:id", protect, admin, deleteSellerByAdmin);

module.exports = router;
