const Seller = require("../models/Seller");
const User = require("../models/User");
const Book = require("../models/Book");
const Notification = require("../models/Notification");
const NotificationService = require("../notificationService");
const sendEmail = require("../utils/sendEmail");

const moment = require("moment");
const { Parser } = require("json2csv");

// Seller actions
const registerSeller = async (req, res) => {
  try {
    const { storeName, bio, banner, logo } = req.body;

    const existing = await Seller.findOne({ user: req.user._id });
    if (existing) return res.status(400).json({ message: "Seller profile already exists" });

    const seller = new Seller({
      user: req.user._id,
      storeName,
      bio,
      banner,
      logo,
      status: "pending",
    });

    await seller.save();
    res.status(201).json({ message: "Seller registration submitted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const editSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    Object.assign(seller, req.body);
    seller.status = "pending";
    await seller.save();

    res.status(200).json({ message: "Seller profile updated. Awaiting re-approval." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findOneAndDelete({ user: req.user._id });
    if (!seller) return res.status(404).json({ message: "Seller profile not found" });
    res.status(200).json({ message: "Seller profile deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getSellerStorefront = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id).populate("user", "name");
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    const books = await Book.find({ seller: seller._id, isActive: true });
    res.json({ seller, books });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getSellerDashboard = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    const books = await Book.find({ seller: seller._id });

    const filteredBooks = books.map((book) => {
      const salesHistory = book.salesHistory.filter((sh) => {
        const date = moment(sh.date);
        return (!startDate || date.isSameOrAfter(startDate)) && (!endDate || date.isSameOrBefore(endDate));
      });
      return { ...book.toObject(), salesHistory };
    });

    const totalRevenue = filteredBooks.reduce(
      (sum, book) => sum + book.salesHistory.reduce((s, sh) => s + sh.revenue, 0),
      0
    );
    const totalUnits = filteredBooks.reduce(
      (sum, book) => sum + book.salesHistory.reduce((s, sh) => s + sh.quantity, 0),
      0
    );
    const totalViews = filteredBooks.reduce((sum, book) => sum + book.viewCount, 0);
    const averageRating = books.length
      ? (
          books.reduce((sum, book) => sum + (book.averageRating || 0), 0) /
          books.length
        ).toFixed(2)
      : 0;

    const chartData = filteredBooks.flatMap((book) =>
      book.salesHistory.map((sh) => ({
        date: moment(sh.date).format("YYYY-MM-DD"),
        quantity: sh.quantity,
        revenue: sh.revenue,
      }))
    );

    res.json({ books: filteredBooks, totalRevenue, totalUnits, totalViews, averageRating, chartData });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPendingSellers = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const sellers = await Seller.find({ status: "pending" })
    .populate("user", "email name")
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Seller.countDocuments({ status: "pending" });

  res.json({ sellers, total });
};

const getApprovedSellers = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const sellers = await Seller.find({ status: "approved" })
    .populate("user", "email name")
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Seller.countDocuments({ status: "approved" });

  res.json({ sellers, total });
};

const approveSeller = async (req, res) => {
  const seller = await Seller.findById(req.params.id).populate("user");
  if (!seller) return res.status(404).json({ message: "Seller not found" });

  seller.status = "approved";
  await seller.save();

  await NotificationService.sendPushNotification(
    seller.user._id,
    "Your seller account has been approved!",
    { type: "sellerStatus", title: "Seller Approved" }
  );

  await sendEmail({
    email: seller.user.email,
    subject: "Seller Account Approved",
    message: `Hi ${seller.user.name}, your seller profile has been approved.`
  });

  res.status(200).json({ message: "Seller approved and notified" });
};

const rejectSeller = async (req, res) => {
  const seller = await Seller.findById(req.params.id).populate("user");
  if (!seller) return res.status(404).json({ message: "Seller not found" });

  seller.status = "rejected";
  await seller.save();

  await NotificationService.sendPushNotification(
    seller.user._id,
    "Your seller account has been rejected.",
    { type: "sellerStatus", title: "Seller Rejected" }
  );

  await sendEmail({
    email: seller.user.email,
    subject: "Seller Account Rejected",
    message: `Hi ${seller.user.name}, unfortunately, your seller profile has been rejected.`
  });

  res.status(200).json({ message: "Seller rejected and notified" });
};

const requestReapproval = async (req, res) => {
  const seller = await Seller.findOne({ user: req.user._id });
  if (!seller || seller.status !== "rejected") {
    return res.status(400).json({ message: "Seller not eligible for re-approval" });
  }
  seller.status = "pending";
  await seller.save();
  res.json({ message: "Re-approval requested" });
};

const deleteSellerByAdmin = async (req, res) => {
  const seller = await Seller.findByIdAndDelete(req.params.id);
  if (!seller) return res.status(404).json({ message: "Seller not found" });
  res.status(200).json({ message: "Seller deleted by admin" });
};

const getAdminSellerMetrics = async (req, res) => {
  try {
    const { startDate, endDate, exportCsv } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sellers = await Seller.find(query).populate("user", "email name");

    const approvedSellers = sellers.filter(s => s.status === "approved").length;
    const pendingSellers = sellers.filter(s => s.status === "pending").length;
    const rejectedSellers = sellers.filter(s => s.status === "rejected").length;

    const dailyCounts = {};
    sellers.forEach((s) => {
      const day = moment(s.createdAt).format("YYYY-MM-DD");
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });

    const result = {
      totalSellers: sellers.length,
      approvedSellers,
      pendingSellers,
      rejectedSellers,
      dailyCounts,
    };

    if (exportCsv === "true") {
      const fields = ["user.name", "user.email", "storeName", "status", "createdAt"];
      const parser = new Parser({ fields });
      const csv = parser.parse(sellers);

      res.header("Content-Type", "text/csv");
      res.attachment("seller_metrics.csv");
      return res.send(csv);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
  requestReapproval,
  deleteSellerByAdmin,
  getAdminSellerMetrics,
};