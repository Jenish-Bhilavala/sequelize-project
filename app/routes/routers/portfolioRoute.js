const express = require('express');
const router = express.Router();
const upload = require('../../utils/multer');
const portfolioModel = require('../../controllers/portfolioController');

router.post('/', upload.array('image'), portfolioModel.addPortfolio);
router.post('/list-portfolio', portfolioModel.listOfPortfolio);
router.get('/view-portfolio/:id', portfolioModel.viewPortfolio);
router.put('/update-portfolio/:id', portfolioModel.updatePortfolio);
router.delete('/delete-portfolio/:id', portfolioModel.deletePortfolio);

module.exports = router;
