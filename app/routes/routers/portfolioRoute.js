const express = require('express');
const router = express.Router();
const upload = require('../../utils/multer');
const portfolioModel = require('../../controllers/portfolioController');
const { globalRoute } = require('../../utils/globalRoute');

router.post('/', upload.array('image'), portfolioModel.addPortfolio);
router.post('/list-portfolio', portfolioModel.listOfPortfolio);
router.get('/view-portfolio/:id', portfolioModel.viewPortfolio);
router.put(
  '/update-portfolio/:id',
  upload.array('image'),
  portfolioModel.updatePortfolio
);
router.delete('/delete-portfolio/:id', portfolioModel.deletePortfolio);
router.all('*', globalRoute);

module.exports = router;
