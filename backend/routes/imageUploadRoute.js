const express = require("express");
const router = express.Router();

const imageUploadController = require("../controllers/imageUploadController");

// Image upload routes
router.post("/upload-profile-picture", 
  imageUploadController.upload.single('image'), 
  imageUploadController.uploadProfilePicture
);

router.post("/upload-carousel-images", 
  imageUploadController.upload.array('images', 1000), 
  imageUploadController.uploadCarouselImages
);

router.get("/vendor-images/:phoneNumber", imageUploadController.getVendorImages);
router.delete("/delete-carousel-image", imageUploadController.deleteCarouselImage);
router.delete("/delete-profile-picture", imageUploadController.deleteProfilePicture);

module.exports = router; 