const Category = require('../models/Category')
const Bank = require('../models/Bank')
const Item = require('../models/Item')
const Image = require('../models/Image')
const Feature = require('../models/Feature')
const Activity = require('../models/Activity')
const Booking = require('../models/Booking')
const Member = require('../models/Member')
const Users = require('../models/Users')
const fs = require('fs-extra')
const path = require('path')
const bcrypt = require('bcryptjs')

module.exports = {
  viewSignIn: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage')
      const alertStatus = req.flash('alertStatus')
      const alert = { message: alertMessage, status: alertStatus }
      if (req.session.user === null || req.session.user === undefined) {
        req.flash('alertMessage', `Session Anda sudah Habis`)
        req.flash('alertStatus', 'danger')
        res.render('index.ejs', {
          alert,
          title: 'Staycation | Login',
        })
      } else {
        res.redirect('/admin/dashboard')
      }
    } catch (error) {
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/signin')
    }
  },
  actionSignIn: async (req, res) => {
    try {
      const { username, password } = req.body

      const user = await Users.findOne({ username: username })

      if (!user) {
        req.flash('alertMessage', `Username tidak ditemukan`)
        req.flash('alertStatus', 'danger')
        res.redirect('/admin/signin')
      } else {
        const checkPassword = await bcrypt.compare(password, user.password)
        if (!checkPassword) {
          req.flash('alertMessage', `Password Salah`)
          req.flash('alertStatus', 'danger')
          res.redirect('/admin/signin')
        } else {
          req.session.user = {
            id: user._id,
            username: user.username,
          }
          res.redirect('/admin/dashboard')
        }
      }
    } catch (error) {
      res.redirect('/admin/signin')
    }
  },
  actionLogout: async (req, res) => {
    req.session.destroy()
    res.redirect('/admin/signin')
  },
  viewDashboard: async (req, res) => {
    if (!req.session.user) {
      req.flash('alertMessage', `Session Anda sudah Habis`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/signin')
    }
    try {
      const booking = await Booking.find()
      const item = await Item.find()
      const member = await Member.find()
      res.render('admin/dashboard/dashboard.ejs', {
        title: 'Staycation | Dashboard',
        user: req.session.user,
        booking,
        item,
        member,
      })
    } catch (error) {
      res.redirect('/admin/signin')
    }
  },
  viewCategory: async (req, res) => {
    if (!req.session.user) {
      req.flash('alertMessage', `Session Anda sudah Habis`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/signin')
    }
    try {
      const category = await Category.find()
      const alertMessage = req.flash('alertMessage')
      const alertStatus = req.flash('alertStatus')
      const alert = { message: alertMessage, status: alertStatus }
      res.render('admin/category/category.ejs', {
        category,
        alert,
        title: 'Staycation | Category',
        user: req.session.user,
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
    if (!req.session.user) {
      req.flash('alertMessage', `Session Anda sudah Habis`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/signin')
    }
    try {
      const bank = await Bank.find()
      const alertMessage = req.flash('alertMessage')
      const alertStatus = req.flash('alertStatus')
      const alert = { message: alertMessage, status: alertStatus }
      res.render('admin/bank/bank.ejs', {
        title: 'Staycation | Bank',
        alert,
        bank,
        user: req.session.user,
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
    if (!req.session.user) {
      req.flash('alertMessage', `Session Anda sudah Habis`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/signin')
    }
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
        user: req.session.user,
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
    if (!req.session.user) {
      req.flash('alertMessage', `Session Anda sudah Habis`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/signin')
    }
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
        user: req.session.user,
      })
    } catch (error) {
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/item')
    }
  },
  viewEditItem: async (req, res) => {
    if (!req.session.user) {
      req.flash('alertMessage', `Session Anda sudah Habis`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/signin')
    }
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
        user: req.session.user,
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
  viewDetailItem: async (req, res) => {
    if (!req.session.user) {
      req.flash('alertMessage', `Session Anda sudah Habis`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/signin')
    }
    const { itemId } = req.params
    try {
      const alertMessage = req.flash('alertMessage')
      const alertStatus = req.flash('alertStatus')
      const feature = await Feature.find()
      const activity = await Activity.find()
      const alert = { message: alertMessage, status: alertStatus }
      res.render('admin/item/detailItem/viewDetail.ejs', {
        title: 'Staycation | Details Item',
        alert,
        itemId,
        feature,
        activity,
        user: req.session.user,
      })
    } catch (error) {
      req.flash('alertMessage', `${error._message}`)
      req.flash('alertStatus', 'danger')
      res.redirect(`/admin/item/detail/${itemId}`)
    }
  },
  addFeature: async (req, res) => {
    const { name, qty, itemId } = req.body
    try {
      if (!req.file) {
        req.flash('alertMessage', 'Image Not Found')
        req.flash('alertStatus', 'success')
        res.redirect(`/admin/item/detail/${itemId}`)
      }
      const feature = await Feature.create({
        name,
        qty,
        itemId,
        imageUrl: `images/${req.file.filename}`,
      })
      const item = await Item.findOne({ _id: itemId })
      item.featureId.push({ _id: feature._id })
      await item.save()
      req.flash('alertMessage', 'Success Added Feature')
      req.flash('alertStatus', 'success')
      res.redirect(`/admin/item/detail/${itemId}`)
    } catch (error) {
      req.flash('alertMessage', `${error._message}`)
      req.flash('alertStatus', 'danger')
      res.redirect(`/admin/item/detail/${itemId}`)
    }
  },
  editFeature: async (req, res) => {
    const { id, name, qty, itemId } = req.body

    try {
      const feature = await Feature.findOne({ _id: id })
      if (req.file === undefined) {
        feature.name = name
        feature.qty = qty
        await feature.save()
        req.flash('alertMessage', 'Success Updated feature')
        req.flash('alertStatus', 'success')
        res.redirect(`/admin/item/detail/${itemId}`)
      } else {
        await fs.unlink(path.join(`public/${feature.imageUrl}`))
        feature.name = name
        feature.qty = qty
        feature.imageUrl = `images/${req.file.filename}`
        await feature.save()
        req.flash('alertMessage', 'Success Updated Bank')
        req.flash('alertStatus', 'success')
        res.redirect(`/admin/item/detail/${itemId}`)
      }
    } catch (error) {
      req.flash('alertMessage', `${error._message}`)
      req.flash('alertStatus', 'danger')
      res.redirect(`/admin/item/detail/${itemId}`)
    }
  },
  deleteFeature: async (req, res) => {
    const { id, itemId } = req.params
    try {
      const feature = await Feature.findOne({ _id: id })
      const item = await Item.findOne({ _id: itemId }).populate('featureId')
      for (let i = 0; i < item.featureId.length; i++) {
        if (item.featureId[i]._id.toString() === feature._id.toString()) {
          item.featureId.pull({ _id: feature._id })
          await item.save()
        }
      }
      await fs.unlink(path.join(`public/${feature.imageUrl}`))
      await feature.remove()
      req.flash('alertMessage', 'Success Deleted Feature')
      req.flash('alertStatus', 'success')
      res.redirect(`/admin/item/detail/${itemId}`)
    } catch (error) {
      req.flash('alertMessage', `${error._message}`)
      req.flash('alertStatus', 'danger')
      res.redirect(`/admin/item/detail/${itemId}`)
    }
  },
  addActivity: async (req, res) => {
    const { name, type, itemId } = req.body
    try {
      if (!req.file) {
        req.flash('alertMessage', 'Image Not Found')
        req.flash('alertStatus', 'success')
        res.redirect(`/admin/item/detail/${itemId}`)
      }
      const activity = await Activity.create({
        name,
        type,
        itemId,
        imageUrl: `images/${req.file.filename}`,
      })
      const item = await Item.findOne({ _id: itemId })
      item.activityId.push({ _id: activity._id })
      await item.save()
      req.flash('alertMessage', 'Success Added Activity')
      req.flash('alertStatus', 'success')
      res.redirect(`/admin/item/detail/${itemId}`)
    } catch (error) {
      req.flash('alertMessage', `${error._message}`)
      req.flash('alertStatus', 'danger')
      res.redirect(`/admin/item/detail/${itemId}`)
    }
  },
  editActivity: async (req, res) => {
    const { id, name, type, itemId } = req.body
    try {
      const activity = await Activity.findOne({ _id: id })
      if (req.file === undefined) {
        activity.name = name
        activity.type = type
        await activity.save()
        req.flash('alertMessage', 'Success Updated activity')
        req.flash('alertStatus', 'success')
        res.redirect(`/admin/item/detail/${itemId}`)
      } else {
        await fs.unlink(path.join(`public/${activity.imageUrl}`))
        activity.name = name
        activity.type = type
        activity.imageUrl = `images/${req.file.filename}`
        await activity.save()
        req.flash('alertMessage', 'Success Updated Activity')
        req.flash('alertStatus', 'success')
        res.redirect(`/admin/item/detail/${itemId}`)
      }
    } catch (error) {
      req.flash('alertMessage', `${error._message}`)
      req.flash('alertStatus', 'danger')
      res.redirect(`/admin/item/detail/${itemId}`)
    }
  },
  deleteActivity: async (req, res) => {
    const { id, itemId } = req.params

    try {
      const activity = await Activity.findOne({ _id: id })
      const item = await Item.findOne({ _id: itemId }).populate('activityId')
      for (let i = 0; i < item.activityId.length; i++) {
        if (item.activityId[i]._id.toString() === activity._id.toString()) {
          item.activityId.pull({ _id: activity._id })
          await item.save()
        }
      }
      await fs.unlink(path.join(`public/${activity.imageUrl}`))
      await activity.remove()
      req.flash('alertMessage', 'Success Deleted Activity')
      req.flash('alertStatus', 'success')
      res.redirect(`/admin/item/detail/${itemId}`)
    } catch (error) {
      req.flash('alertMessage', `${error._message}`)
      req.flash('alertStatus', 'danger')
      res.redirect(`/admin/item/detail/${itemId}`)
    }
  },
  viewBooking: async (req, res) => {
    if (!req.session.user) {
      req.flash('alertMessage', `Session Anda sudah Habis`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/signin')
    }
    try {
      const alertMessage = req.flash('alertMessage')
      const alertStatus = req.flash('alertStatus')
      const booking = await Booking.find()
        .populate('memberId')
        .populate('bankId')
      const alert = { message: alertMessage, status: alertStatus }
      res.render('admin/booking/booking.ejs', {
        title: 'Staycation | Booking',
        alert,
        booking,
        user: req.session.user,
      })
    } catch (error) {
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/booking')
    }
  },
  viewDetailBooking: async (req, res) => {
    if (!req.session.user) {
      req.flash('alertMessage', `Session Anda sudah Habis`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/signin')
    }
    try {
      const { id } = req.params
      const booking = await Booking.findOne({ _id: id })
        .populate('memberId')
        .populate('bankId')

      const alertMessage = req.flash('alertMessage')
      const alertStatus = req.flash('alertStatus')
      const alert = { message: alertMessage, status: alertStatus }
      res.render('admin/booking/detail.ejs', {
        title: 'Staycation | Detail Booking',
        alert,
        booking,
        user: req.session.user,
      })
    } catch (error) {
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/booking')
    }
  },
  actionConfirmation: async (req, res) => {
    const { id } = req.params
    try {
      const booking = await Booking.findOne({ _id: id })
      booking.payments.status = 'Accept'
      await booking.save()
      req.flash('alertMessage', 'Success Confirmation')
      req.flash('alertStatus', 'success')
      res.redirect(`/admin/booking/${id}`)
    } catch (error) {
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/booking')
    }
  },
  actionReject: async (req, res) => {
    const { id } = req.params
    try {
      const booking = await Booking.findOne({ _id: id })
      booking.payments.status = 'Failed'
      await booking.save()
      req.flash('alertMessage', 'Confirmation has Failed')
      req.flash('alertStatus', 'success')
      res.redirect(`/admin/booking/${id}`)
    } catch (error) {
      req.flash('alertMessage', `${error.message}`)
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/booking')
    }
  },
}
