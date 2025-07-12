const Seller = require("../models/Seller");
const User = require("../models/User");
const Book = require("../models/Book");
const Notification = require("../models/Notification");
const sendFCMNotification = require("../utils/sendFCMNotification"); // hypothetical helper for FCM

// Register as a Seller
const registerSeller = async (req, res) => {
  try {
    const userId = req.user._id;
    const { storeName, banner, logo, bio } = req.body;

    let seller = await Seller.findOne({ user: userId });

    if (seller && seller.status === "approved") {
      return res.status(400).json({ message: "User is already a seller" });
    }

    if (seller && seller.status === "rejected") {
      seller.storeName = storeName;
      seller.banner = banner;
      seller.logo = logo;
      seller.bio = bio;
      seller.status = "pending";
      await seller.save();

      await Notification.create({
        recipient: userId,
        type: "seller",
        message: "Your request to re-apply as a seller has been submitted.",
        entityId: seller._id,
      });

      await sendFCMNotification(
        userId,
        "Seller Re-application Submitted",
        "Your request to re-apply as a seller has been submitted."
      );

      return res
        .status(200)
        .json({ message: "Re-application submitted for review" });
    }

    if (seller) {
      return res
        .status(400)
        .json({ message: "Seller application already submitted" });
    }

    seller = new Seller({
      user: userId,
      storeName,
      banner,
      logo,
      bio,
      status: "pending",
    });

    await seller.save();

    await Notification.create({
      recipient: userId,
      type: "seller",
      message:
        "Your request to register as a seller has been received and is under review.",
      entityId: seller._id,
    });

    await sendFCMNotification(
      userId,
      "Seller Application Submitted",
      "Your request to register as a seller has been received and is under review."
    );

    res
      .status(201)
      .json({ message: "Seller registration submitted for review" });
  } catch (error) {
    console.error("Error registering seller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit Seller Profile
const editSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller || seller.status !== "approved") {
      return res.status(403).json({ message: "Not authorized as a seller" });
    }

    const { storeName, banner, logo, bio } = req.body;
    if (storeName) seller.storeName = storeName;
    if (banner) seller.banner = banner;
    if (logo) seller.logo = logo;
    if (bio) seller.bio = bio;

    await seller.save();
    res.json({ message: "Seller profile updated", seller });
  } catch (error) {
    console.error("Error editing seller profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Seller Profile
const deleteSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findOneAndDelete({ user: req.user._id });
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    res.json({ message: "Seller profile deleted" });
  } catch (error) {
    console.error("Error deleting seller profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get seller storefront
const getSellerStorefront = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id).populate(
      "user",
      "name profilePicture"
    );
    if (!seller || seller.status !== "approved") {
      return res
        .status(404)
        .json({ message: "Seller not found or not approved" });
    }

    const books = await Book.find({ seller: seller._id, isActive: true });
    res.json({ seller, books });
  } catch (error) {
    console.error("Error fetching storefront:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get seller dashboard
const getSellerDashboard = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller || seller.status !== "approved") {
      return res.status(403).json({ message: "Not authorized as a seller" });
    }

    const books = await Book.find({ seller: seller._id })
      .skip(skip)
      .limit(limit);
    const totalBooks = await Book.countDocuments({ seller: seller._id });

    const totalSales = books.reduce((sum, book) => sum + book.purchaseCount, 0);
    const totalRevenue = books.reduce(
      (sum, book) =>
        sum + book.salesHistory.reduce((rev, s) => rev + s.revenue, 0),
      0
    );

    const salesByDate = {};
    books.forEach((book) => {
      book.salesHistory.forEach((sale) => {
        const date = new Date(sale.date).toISOString().split("T")[0];
        if (!salesByDate[date]) salesByDate[date] = 0;
        salesByDate[date] += sale.revenue;
      });
    });

    res.json({
      seller,
      booksCount: totalBooks,
      totalSales,
      totalRevenue,
      salesByDate,
      currentPage: page,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.error("Error fetching seller dashboard:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Get pending sellers (paginated)
const getPendingSellers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Seller.countDocuments({ status: "pending" });
    const sellers = await Seller.find({ status: "pending" })
      .populate("user", "name email")
      .skip(skip)
      .limit(limit);

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      sellers,
    });
  } catch (error) {
    console.error("Error fetching pending sellers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Get approved sellers (paginated)
const getApprovedSellers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Seller.countDocuments({ status: "approved" });
    const sellers = await Seller.find({ status: "approved" })
      .populate("user", "name email")
      .skip(skip)
      .limit(limit);

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      sellers,
    });
  } catch (error) {
    console.error("Error fetching approved sellers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Approve seller
const approveSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id).populate("user");
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    seller.status = "approved";
    await seller.save();

    await Notification.create({
      recipient: seller.user._id,
      type: "seller",
      message: "Congratulations! Your seller application has been approved.",
      entityId: seller._id,
    });

    await sendFCMNotification(
      seller.user._id,
      "Seller Approved",
      "Congratulations! Your seller application has been approved."
    );

    res.json({ message: "Seller approved" });
  } catch (error) {
    console.error("Error approving seller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Reject seller
const rejectSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id).populate("user");
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    seller.status = "rejected";
    await seller.save();

    await Notification.create({
      recipient: seller.user._id,
      type: "seller",
      message:
        "Unfortunately, your seller application has been rejected. You may reapply with updated information.",
      entityId: seller._id,
    });

    await sendFCMNotification(
      seller.user._id,
      "Seller Rejected",
      "Unfortunately, your seller application has been rejected. You may reapply."
    );

    res.json({ message: "Seller rejected" });
  } catch (error) {
    console.error("Error rejecting seller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerSeller,
  editSellerProfile,
  deleteSellerProfile,
  getSellerStorefront,
  getSellerDashboard,
  getPendingSellers,
  getApprovedSellers,
  approveSeller,
  rejectSeller,
};
