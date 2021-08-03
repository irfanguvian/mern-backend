module.exports = {
  viewDashboard: (req, res) => {
    res.render('admin/dashboard/dashboard.ejs')
  },
  viewCategory: (req, res) => {
    res.render('admin/category/category.ejs')
  },
  viewBank: (req, res) => {
    res.render('admin/bank/bank.ejs')
  },
  viewItem: (req, res) => {
    res.render('admin/item/item.ejs')
  },
  viewBooking: (req, res) => {
    res.render('admin/booking/booking.ejs')
  },
}
