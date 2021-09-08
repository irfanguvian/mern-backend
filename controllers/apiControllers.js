const Category = require("../models/Category");
const Bank = require("../models/Bank");
const Item = require("../models/Item");
const Image = require("../models/Image");
const Feature = require("../models/Feature");
const Activity = require("../models/Activity");
const Booking = require("../models/Booking");
const Member = require("../models/Member");
const Users = require("../models/Users");

module.exports = {
  landingpage: async (req, res) => {
    try {
      const mostPicked = await Item.find()
        .select("_id title country city price unit imageId")
        .limit(5)
        .populate({ path: "imageId", select: "_id imageUrl" });

      const category = await Category.find()
        .select("_id name")
        .limit(3)
        .populate({
          path: "itemId",
          select: "_id title country city isPopular imageId",
          perDocumentLimit: 4,
          populate: {
            path: "imageId",
            select: "_id imageUrl",
            perDocumentLimit: 1,
          },
        });

      const traveler = await Booking.find();
      const treasure = await Activity.find();

      for (let i = 0; i < category.length; i++) {
        for (let j = 0; j < category[i].itemId.length; j++) {
          const item = await Item.findOne({ _id: category[i].itemId[j]._id });
          if (category[i].itemId[0] === category[i].itemId[j]) {
            item.isPopular = true;
          } else {
            item.isPopular = false;
          }
          await item.save();
        }
      }

      const testimonial = {
        _id: "asd1293uasdads1",
        imageUrl: "/images/testimonial2.jpg",
        name: "Happy Family",
        rate: "4.55",
        content:
          "What a great trip with my family and I should try again next time soon ...",
        familyName: "Angga",
        familyOccupation: "Product Designer",
      };

      res.status(200).json({
        hero: {
          travelers: traveler.length,
          treasures: treasure.length,
          cities: mostPicked.length,
        },
        mostPicked,
        category,
        testimonial,
      });
    } catch (error) {
      res.status(500).json({
        message: "Sorry for the inconvenience , Internal Server Problems",
      });
    }
  },
  detailpage: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Item.findOne({ _id: id })
        .populate({ path: "featureId", select: "_id name qty imageUrl" })
        .populate({ path: "activityId", select: "_id name type imageUrl" })
        .populate({ path: "imageId", select: "_id imageUrl" });
      const bank = await Bank.find();

      const testimonial = {
        _id: "asd1293uasdads1",
        imageUrl: "/images/testimonial1.jpg",
        name: "Happy Family",
        rate: "4.55",
        content:
          "What a great trip with my family and I should try again next time soon ...",
        familyName: "Angga",
        familyOccupation: "Product Designer",
      };

      res.status(200).json({
        ...item._doc,
        bank,
        testimonial,
      });
    } catch (error) {
      res.status(404);
      console.log(error);
    }
  },
  bookingpage: async (req, res) => {
    function validateInputs(body) {
      let validate = false;
      for (const property in body) {
        if (body[property] === "") {
          validate = true;
        }
      }
      return validate;
    }

    const {
      idItem,
      duration,
      bookingStartDate,
      bookingEndDate,
      firstName,
      lastName,
      email,
      phoneNumber,
      accountHolder,
      bankFrom,
    } = req.body;

    if (!req.file) {
      return res.status(404).json({ message: "image not found" });
    }

    if (validateInputs(req.body)) {
      return res.status(404).json({ message: "Lengkapi field" });
    }
    const item = await Item.findOne({ _id: idItem });
    if (!item) {
      return res.status(404).json({ message: "Item Not Found" });
    }
    item.sumBooking += 1;
    await item.save();

    let total = item.price * duration;
    let tax = total * 0.1;

    const invoice = Math.floor(1000000 * Math.random() * 9000000);
    const member = await Member.create({
      firstName,
      lastName,
      email,
      phoneNumber,
    });

    const newBooking = {
      invoice,
      bookingStartDate,
      bookingEndDate,
      total: (total += tax),
      itemId: {
        _id: item.id,
        title: item.title,
        price: item.price,
        duration: duration,
      },
      memberId: member.id,
      payments: {
        proofPayment: `images/${req.file.filename}`,
        bankFrom: bankFrom,
        accountHolder: accountHolder,
      },
    };
    const booking = await Booking.create(newBooking);
    res.status(200).json({ message: "Success Booking", booking });
  },
};
