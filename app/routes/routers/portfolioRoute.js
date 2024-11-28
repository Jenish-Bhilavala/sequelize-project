const express = require('express');
const router = express.Router();
const upload = require('../../utils/multer');
const portfolioModel = require('../../controllers/portfolioController');

router.post('/', upload.array('image[]', 2), portfolioModel.addPortfolio);
router.get("/", portfolioModel.listPortfolio);
router.get("/:id", portfolioModel.viewPortfolio);
router.put("/:id", portfolioModel.updatePortfolio);
router.delete("/:id", portfolioModel.deletePortfolio);

module.exports = router;
