const express = require('express');
const router = express.Router();
const categoryModel = require('../../controllers/categoryController');

router.post('/', categoryModel.addCategory);
router.post('/list-category', categoryModel.listCategory);
router.get('/:id', categoryModel.viewCategory);
router.put('/:id', categoryModel.updateCategory);
router.delete('/:id', categoryModel.deleteCategory);

module.exports = router;
