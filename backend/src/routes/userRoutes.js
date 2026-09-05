const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getMyProfile,
  updateMyProfile,
  getSuggestions,
  getUserProfile,
  toggleFollow,
  deleteMyAccount,
} = require("../controllers/userController");

const router = express.Router();

router.use(protect);
router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);
router.delete("/me", deleteMyAccount);
router.get("/suggestions", getSuggestions);
router.get("/:id", getUserProfile);
router.post("/:id/follow", toggleFollow);

module.exports = router;
