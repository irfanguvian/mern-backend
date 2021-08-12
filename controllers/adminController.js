const Category = require('../models/Category')
const Bank = require('../models/Bank')
const Item = require('../models/Item')
const Image = require('../models/Image')
const fs = require('fs-extra')
const path = require('path')
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
    } catch (error) {
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.render('admin/category/category.ejs', {
        alert,
        title: 'Staycation | Category',
      })
    }
  },
  addCategory: async (req, res) => {
    const { name } = req.body
    try {
      await Category.create({ name })
      req.flash('alertMessage', 'Success Added Category')
      req.flash('alertStatus', 'success')
      res.redirect('/admin/category')
    } catch (error) {
      req.flash('alertMessage', `${error.message}`)
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
      req.flash('alertMessage', `${error.message}`)
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
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/category')
    }
  },
  viewBank: async (req, res) => {
    try {
      const bank = await Bank.find()
      const alertMessage = req.flash('alertMessage')
      const alertStatus = req.flash('alertStatus')
      const alert = { message: alertMessage, status: alertStatus }
      res.render('admin/bank/bank.ejs', {
        title: 'Staycation | Bank',
        alert,
        bank,
      })
    } catch (error) {
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.render('admin/bank/bank.ejs')
    }
  },
  addBank: async (req, res) => {
    const { name, nameBank, nomorRekening } = req.body
    try {
      await Bank.create({
        name,
        nameBank,
        nomorRekening,
        imageUrl: `images/${req.file.filename}`,
      })
      req.flash('alertMessage', 'Success Added Bank')
      req.flash('alertStatus', 'success')
      res.redirect('/admin/bank')
    } catch (error) {
      req.flash('alertMessage', `${error._message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/bank')
    }
  },
  editBank: async (req, res) => {
    try {
      const { id, name, nameBank, nomorRekening } = req.body
      const bank = await Bank.findOne({ _id: id })
      if (req.file === undefined) {
        bank.name = name
        bank.nomorRekening = nomorRekening
        bank.nameBank = nameBank
        await bank.save()
        req.flash('alertMessage', 'Success Updated Bank')
        req.flash('alertStatus', 'success')
        res.redirect('/admin/bank')
      } else {
        await fs.unlink(path.join(`public/${bank.imageUrl}`))
        bank.name = name
        bank.nomorRekening = nomorRekening
        bank.nameBank = nameBank
        bank.imageUrl = `images/${req.file.filename}`
        await bank.save()
        req.flash('alertMessage', 'Success Updated Bank')
        req.flash('alertStatus', 'success')
        res.redirect('/admin/bank')
      }
    } catch (error) {
      req.flash('alertMessage', `${error._message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/bank')
    }
  },
  deleteBank: async (req, res) => {
    const { id } = req.params
    try {
      const bank = await Bank.findOne({ _id: id })
      await fs.unlink(path.join(`public/${bank.imageUrl}`))
      await bank.remove()
      req.flash('alertMessage', 'Success Deleted Bank')
      req.flash('alertStatus', 'success')
      res.redirect('/admin/bank')
    } catch (error) {
      req.flash('alertMessage', `${error._message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/bank')
    }
  },
  viewItem: async (req, res) => {
    try {
      const category = await Category.find()
      const items = await Item.find()
        .populate({ path: 'imageId', select: 'id imageUrl' })
        .populate({ path: 'categoryId', select: 'id name' })
      const alertMessage = req.flash('alertMessage')
      const alertStatus = req.flash('alertStatus')
      const alert = { message: alertMessage, status: alertStatus }
      res.render('admin/item/item.ejs', {
        title: 'Staycation | Items',
        category,
        alert,
        items,
        action: 'view',
      })
    } catch (error) {
      req.flash('alertMessage', `${error._message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/item')
    }
  },
  addItem: async (req, res) => {
    try {
      const { categoryId, title, price, city, about } = req.body
      if (req.files.length > 0) {
        const category = await Category.findOne({ _id: categoryId })
        const newItem = {
          categoryId,
          title,
          description: about,
          price,
          city,
        }
        const item = await Item.create(newItem)
        category.itemId.push({ _id: item._id })
        await category.save()
        for (let i = 0; i < req.files.length; i++) {
          const imageSave = await Image.create({
            imageUrl: `images/${req.files[i].filename}`,
          })
          item.imageId.push({ _id: imageSave._id })
          await item.save()
        }
        req.flash('alertMessage', 'Success Add Item')
        req.flash('alertStatus', 'success')
        res.redirect('/admin/item')
      }
    } catch (error) {
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/item')
    }
  },
  viewImage: async (req, res) => {
    try {
      const { id } = req.params
      const images = await Item.findOne({ _id: id }).populate({
        path: 'imageId',
        select: 'id imageUrl',
      })
      const alertMessage = req.flash('alertMessage')
      const alertStatus = req.flash('alertStatus')
      const alert = { message: alertMessage, status: alertStatus }
      res.render('admin/item/item.ejs', {
        title: 'Staycation | Images',
        images,
        alert,
        action: 'show image',
      })
    } catch (error) {
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/item')
    }
  },
  viewEditItem: async (req, res) => {
    try {
      const { id } = req.params
      const category = await Category.find()
      const item = await Item.findOne({ _id: id })
        .populate({
          path: 'imageId',
          select: 'id imageUrl',
        })
        .populate({ path: 'categoryId', select: 'id name' })
      const alertMessage = req.flash('alertMessage')
      const alertStatus = req.flash('alertStatus')
      const alert = { message: alertMessage, status: alertStatus }
      res.render('admin/item/item.ejs', {
        title: 'Staycation | Edit Item',
        item,
        alert,
        category,
        action: 'edit',
      })
    } catch (error) {
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/item')
    }
  },
  editItem: async (req, res) => {
    try {
      const { id } = req.params
      const item = await Item.findOne({ _id: id })
        .populate({
          path: 'imageId',
          select: 'id imageUrl',
        })
        .populate({ path: 'categoryId', select: 'id name' })
      const { categoryId, title, price, city, about } = req.body
      if (req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const imageUpdate = await Image.findOne({ _id: item.imageId[i]._id })
          await fs.unlink(path.join(`public/${imageUpdate.imageUrl}`))
          imageUpdate.imageUrl = `images/${req.files[i].filename}`
          await imageUpdate.save()
        }
        item.title = title
        item.categoryId = categoryId
        item.price = price
        item.city = city
        item.about = about
        await item.save()
        req.flash('alertMessage', 'Success Edit Item')
        req.flash('alertStatus', 'success')
        res.redirect('/admin/item')
      } else {
        item.title = title
        item.categoryId = categoryId
        item.price = price
        item.city = city
        item.about = about
        await item.save()
        req.flash('alertMessage', 'Success Edit Item')
        req.flash('alertStatus', 'success')
        res.redirect('/admin/item')
      }
    } catch (error) {
      console.log(error)
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/item')
    }
  },
  deleteItem: async (req, res) => {
    try {
      const { id } = req.params
      const item = await Item.findOne({ _id: id }).populate('imageId')
      for (let i = 0; i < item.imageId.length; i++) {
        Image.findOne({ _id: item.imageId[i]._id })
          .then((image) => {
            fs.unlink(path.join(`public/${image.imageUrl}`))
            image.remove()
          })
          .catch((error) => {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/item')
          })
      }
      await item.remove()
      req.flash('alertMessage', 'Success Deleted Item')
      req.flash('alertStatus', 'success')
      res.redirect('/admin/item')
    } catch (error) {
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/item')
    }
  },
  viewBooking: (req, res) => {
    res.render('admin/booking/booking.ejs', { title: 'Staycation | Booking' })
  },
}
