const express = require("express");
const authController = require("../controllers/authController");
const utils = require("../utils");
const eventsController = require("../controllers/eventsController");
const router = express.Router();

router.get("/login", authController.login);
router.get("/request_access", authController.request_access);
router.get("/refresh_token", authController.refresh_token);


router.get("/dashboard", utils.is_authenticated_middleware, eventsController.dashboard);
router.get("/events/create", utils.is_authenticated_middleware, eventsController.create);
router.post("/events/store", utils.is_authenticated_middleware, eventsController.store);
router.get("/dashboard/events/:event_title", utils.is_authenticated_middleware, eventsController.show);
router.post("/events/update", utils.is_authenticated_middleware, eventsController.update);
router.post("/events/delete", utils.is_authenticated_middleware, eventsController.delete);

module.exports = router;