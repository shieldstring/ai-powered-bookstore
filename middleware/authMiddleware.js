const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Seller = require("../models/Seller");

const protect = async (req, res, next) => {
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      return next();
    } catch (error) {
      console.error("Auth error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

const sellerOnly = async (req, res, next) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });

    if (!seller || seller.status !== "approved") {
      return res
        .status(403)
        .json({ message: "Not authorized as an approved seller" });
    }

    req.seller = seller; // Attach seller info to request object
    next();
  } catch (error) {
    console.error("Seller auth error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { protect, admin, sellerOnly };
