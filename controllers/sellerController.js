const Seller = require("../models/Seller");
const Book = require("../models/Book");
const NotificationService = require("../notificationService");
const sendEmail = require("../utils/sendEmail");
const findSellerByIdOrSlug = require("../utils/findSellerByIdOrSlug");
const moment = require("moment");
const { Parser } = require("json2csv");
const slugify = require("slugify");
const User = require("../models/User");

// Seller registration
const registerSeller = async (req, res) => {
  try {
    const {
      storeName,
      bio,
      banner,
      logo,
      contactEmail,
      contactPhone,
      address,
      payoutDetails, // { bankName, accountNumber, accountName }
    } = req.body;

    const existingSeller = await Seller.findOne({ user: req.user._id });
    if (existingSeller) {
      return res.status(400).json({ message: "Seller profile already exists" });
    }

    const user = await User.findById(req.user._id);

    // Generate slug for User if missing
    if (!user.slug) {
      user.slug =
        slugify(storeName, { lower: true, strict: true }) +
        "-" +
        Math.random().toString(36).substring(2, 8);
      await user.save();
    }

    // Generate slug for Seller
    const sellerSlug =
      slugify(storeName, { lower: true, strict: true }) +
      "-" +
      Math.random().toString(36).substring(2, 8);

    const seller = new Seller({
      user: req.user._id,
      storeName,
      bio,
      banner,
      logo,
      contactEmail,
      contactPhone,
      address,
      payoutDetails,
      slug: sellerSlug,
      status: "pending",
    });

    await seller.save();

    // Update user role to seller
    user.role = "seller";
    await user.save();

    res.status(201).json({
      message: "Seller registration submitted",
      data: {
        seller,
        userSlug: user.slug,
        sellerSlug: seller.slug,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// edit Seller Profile
const editSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const {
      storeName,
      bio,
      banner,
      logo,
      contactEmail,
      contactPhone,
      address,
      payoutDetails, // { bankName, accountNumber, accountName }
    } = req.body;

    // Track if storeName changes for slug regeneration
    const storeNameChanged = storeName && storeName !== seller.storeName;

    // Update base fields
    seller.storeName = storeName || seller.storeName;
    seller.bio = bio || seller.bio;
    seller.banner = banner || seller.banner;
    seller.logo = logo || seller.logo;
    seller.contactEmail = contactEmail || seller.contactEmail;
    seller.contactPhone = contactPhone || seller.contactPhone;
    seller.address = address || seller.address;

    // Update payoutDetails if provided
    if (payoutDetails) {
      seller.payoutDetails.bankName =
        payoutDetails.bankName || seller.payoutDetails.bankName;
      seller.payoutDetails.accountNumber =
        payoutDetails.accountNumber || seller.payoutDetails.accountNumber;
      seller.payoutDetails.accountName =
        payoutDetails.accountName || seller.payoutDetails.accountName;
    }

    // Regenerate slugs if storeName changed
    if (storeNameChanged) {
      const newSlug =
        slugify(storeName, { lower: true, strict: true }) +
        "-" +
        Math.random().toString(36).substring(2, 8);

      seller.slug = newSlug;

      const user = await User.findById(req.user._id);
      user.slug = newSlug;
      await user.save();
    }

    seller.status = "pending"; // Trigger re-approval
    await seller.save();

    res.status(200).json({
      message: "Seller profile updated. Awaiting re-approval.",
      data: {
        seller,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findOneAndDelete({ user: req.user._id });
    if (!seller)
      return res.status(404).json({ message: "Seller profile not found" });
    res.status(200).json({ message: "Seller profile deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Storefront (accepts ID or slug)
const getSellerStorefront = async (req, res) => {
  try {
    const result = await findSellerByIdOrSlug(req.params.idOrSlug);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    const { user, sellerProfile } = result;

    const books = await Book.find({ seller: user._id, isActive: true });

    res.status(200).json({
      success: true,
      message: "Seller storefront fetched successfully",
      data: {
        user,
        sellerProfile,
        books,
      },
    });
  } catch (error) {
    console.error("Storefront error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch seller storefront",
      error: error.message,
    });
  }
};

// Seller Dashboard (user-specific)
const getSellerDashboard = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    const books = await Book.find({ seller: req.user._id });

    const filteredBooks = books.map((book) => {
      const salesHistory = book.salesHistory.filter((sh) => {
        const date = moment(sh.date);
        return (
          (!startDate || date.isSameOrAfter(startDate)) &&
          (!endDate || date.isSameOrBefore(endDate))
        );
      });
      return { ...book.toObject(), salesHistory };
    });

    const totalRevenue = filteredBooks.reduce(
      (sum, book) =>
        sum + book.salesHistory.reduce((s, sh) => s + sh.revenue, 0),
      0
    );
    const totalUnits = filteredBooks.reduce(
      (sum, book) =>
        sum + book.salesHistory.reduce((s, sh) => s + sh.quantity, 0),
      0
    );
    const totalViews = filteredBooks.reduce(
      (sum, book) => sum + book.viewCount,
      0
    );
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

    res.json({
      books: filteredBooks,
      totalRevenue,
      totalUnits,
      totalViews,
      averageRating,
      chartData,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin seller actions (accept ID or slug)
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
  try {
    const seller = await findSellerByIdOrSlug(req.params.idOrSlug);

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
      message: `Hi ${seller.user.name}, your seller profile has been approved.`,
    });

    res.status(200).json({ message: "Seller approved and notified" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const rejectSeller = async (req, res) => {
  try {
    const seller = await findSellerByIdOrSlug(req.params.idOrSlug);

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
      message: `Hi ${seller.user.name}, unfortunately, your seller profile has been rejected.`,
    });

    res.status(200).json({ message: "Seller rejected and notified" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteSellerByAdmin = async (req, res) => {
  try {
    const seller = await findSellerByIdOrSlug(req.params.idOrSlug);

    if (!seller) return res.status(404).json({ message: "Seller not found" });

    await Seller.findByIdAndDelete(seller._id);
    res.status(200).json({ message: "Seller deleted by admin" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const requestReapproval = async (req, res) => {
  const seller = await Seller.findOne({ user: req.user._id });
  if (!seller || seller.status !== "rejected") {
    return res
      .status(400)
      .json({ message: "Seller not eligible for re-approval" });
  }
  seller.status = "pending";
  await seller.save();
  res.json({ message: "Re-approval requested" });
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

    const approvedSellers = sellers.filter(
      (s) => s.status === "approved"
    ).length;
    const pendingSellers = sellers.filter((s) => s.status === "pending").length;
    const rejectedSellers = sellers.filter(
      (s) => s.status === "rejected"
    ).length;

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
      const fields = [
        "user.name",
        "user.email",
        "storeName",
        "status",
        "createdAt",
      ];
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
