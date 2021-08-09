const Category = require('../models/Category')

module.exports = {
  viewDashboard: (req, res) => {
    res.render('admin/dashboard/dashboard.ejs', {
      title: 'Staycation | Dashboard',
    })
  },
  viewCategory: async (req, res) => {
    try {
      const category = await Category.find()
      const alertMessage = req.flash('alertMessage')
      const alertStatus = req.flash('alertStatus')
      const alert = { message: alertMessage, status: alertStatus }
      res.render('admin/category/category.ejs', {
        category,
        alert,
        title: 'Staycation | Category',
      })
    } catch (error) {}
  },
  addCategory: async (req, res) => {
    const { name } = req.body
    try {
      await Category.create({ name })
      req.flash('alertMessage', 'Success Added Category')
      req.flash('alertStatus', 'success')
      res.redirect('/admin/category')
    } catch (error) {
      req.flash('alertMessage', `$error.message`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/category')
    }
  },
  editCategory: async (req, res) => {
    const { id, name } = req.body
    try {
      const category = await Category.findOne({ _id: id })
      category.name = name
      await category.save()
      req.flash('alertMessage', 'Success Updated Category')
      req.flash('alertStatus', 'success')
      res.redirect('/admin/category')
    } catch {
      req.flash('alertMessage', `$error.message`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/category')
    }
  },
  deleteCategory: async (req, res) => {
    const { id } = req.params
    try {
      req.flash('alertMessage', 'Success Deleted Category')
      req.flash('alertStatus', 'success')
      const category = await Category.findOne({ _id: id })
      await category.remove()
      res.redirect('/admin/category')
    } catch (error) {
      req.flash('alertMessage', `$error.message`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/category')
    }
  },
  viewBank: (req, res) => {
    res.render('admin/bank/bank.ejs', { title: 'Staycation | Bank' })
  },
  viewItem: (req, res) => {
    res.render('admin/item/item.ejs', { title: 'Staycation | Items' })
  },
  viewBooking: (req, res) => {
    res.render('admin/booking/booking.ejs', { title: 'Staycation | Booking' })
  },
}
