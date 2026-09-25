var express = require("express");
var router = express.Router();

router.get("/health", function (req, res) {
  res.json({ status: "ok" });
});

module.exports = router;
