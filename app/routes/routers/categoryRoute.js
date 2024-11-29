const express = require('express');
const router = express.Router();
const categoryModel = require('../../controllers/categoryController');

router.post('/', categoryModel.addCategory);
router.post('/list-category', categoryModel.listOfCategory);
router.get('/view-category/:id', categoryModel.viewCategory);
router.put('/update-category/:id', categoryModel.updateCategory);
router.delete('/delete-category/:id', categoryModel.deleteCategory);

module.exports = router;
