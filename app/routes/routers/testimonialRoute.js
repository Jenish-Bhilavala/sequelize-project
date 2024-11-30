const express = require('express');
const router = express.Router();
const upload = require('../../utils/multer');
const testimonialModel = require('../../controllers/testimonialController');
const { globalRoute } = require('../../utils/globalRoute');

router.post('/', upload.single('image'), testimonialModel.addTestimonial);
router.post('/list-testimonial', testimonialModel.listOfTestimonial);
router.get('/view-testimonial/:id', testimonialModel.viewTestimonial);
router.put(
  '/update/:id',
  upload.single('image'),
  testimonialModel.updateTestimonial
);
router.delete('/delete/:id', testimonialModel.deleteTestimonial);
router.all('*', globalRoute);

module.exports = router;
