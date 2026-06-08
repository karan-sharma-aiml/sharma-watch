const Contact = require("../models/Contact");
const { sendSuccess, sendError } = require("../utils/responseHandler");

const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return sendError(res, 400, "All fields (name, email, subject, message) are required.");
    }

    const contact = await Contact.create({ name, email, subject, message });

    return sendSuccess(res, 201, "Your message has been received. We will get back to you soon.", {
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllContacts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [contacts, total] = await Promise.all([
      Contact.find().sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Contact.countDocuments(),
    ]);

    return sendSuccess(res, 200, "Contact submissions fetched.", {
      contacts,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitContact, getAllContacts };