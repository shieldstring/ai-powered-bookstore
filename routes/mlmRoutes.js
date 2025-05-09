const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  addMLMTier,
  updateMLMTier,
  getAllMLMTiers,
  getMLMStats,
  recalculateUserTier,
  deleteMLMTier,
} = require("../controllers/mlmController");

router.post("/admin/mlm/tiers", protect, admin, addMLMTier);
router.put("/admin/mlm/tiers/:id", protect, admin, updateMLMTier);
router.delete("/admin/mlm/tiers/:id", protect, admin, deleteMLMTier);
router.get("/admin/mlm/tiers", protect, getAllMLMTiers); // All users can see tiers
router.get("/admin/mlm/stats", protect, admin, getMLMStats);
router.post(
  "/admin/mlm/recalculate/:userId",
  protect,
  admin,
  recalculateUserTier
);

module.exports = router;
