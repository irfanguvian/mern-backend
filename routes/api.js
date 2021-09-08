const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiControllers");
const { upload, uploadMultiple } = require("../middleware/multer");

/* GET home page. */
router.get("/landing-page", apiController.landingpage);
router.get("/detail-page/:id", apiController.detailpage);
router.post("/booking-page", upload, apiController.bookingpage);

module.exports = router;
