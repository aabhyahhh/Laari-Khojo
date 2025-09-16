    const express = require("express");
    const router = express.Router();

    require("../controllers/authController");
    const { registerValidator, loginValidator } = require("../helpers/validator");

    const auth = require("../middlewares/authMiddleware");

    // Import authController
    const authController = require("../controllers/authController");


    // Use authController.registerUser properly
    router.post("/register", registerValidator, authController.registerUser);
    router.post("/login", loginValidator, authController.loginUser);
    router.post("/google-login", authController.googleLogin);


    //authenticating routes
    router.get("/profile", auth, authController.getProfile);

    router.get("/all-users", authController.getAllUsers);
    router.put("/update-profile",auth, authController.updateProfile);
    module.exports = router;
