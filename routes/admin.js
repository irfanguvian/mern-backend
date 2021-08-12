const router = require('express').Router()
const adminController = require('../controllers/adminController')
const { upload, uploadMultiple } = require('../middleware/multer')
router.get('/dashboard', adminController.viewDashboard)

//Crud Category
router.get('/category', adminController.viewCategory)
router.post('/category', adminController.addCategory)
router.put('/category', adminController.editCategory)
router.delete('/category/:id', adminController.deleteCategory)

//CRUD BANK
router.get('/bank', adminController.viewBank)
router.post('/bank', upload, adminController.addBank)
router.put('/bank', upload, adminController.editBank)
router.delete('/bank/:id', adminController.deleteBank)

//CRUD Item
router.get('/item', adminController.viewItem)
router.post('/item', uploadMultiple, adminController.addItem)
router.get('/item/:id', adminController.viewEditItem)
router.put('/item/:id', uploadMultiple, adminController.editItem)
router.delete('/item/:id/delete', adminController.deleteItem)
router.get('/item/show-image/:id', adminController.viewImage)

router.get('/booking', adminController.viewBooking)

module.exports = router
