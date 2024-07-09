const express = require("express");
const router = express.Router();
const Contact = require("../../models/contacts");
const authenticate = require("../../middlewares/authenticate"); // Middleware do uwierzytelniania

// Użyj middleware do uwierzytelniania dla wszystkich poniższych tras
router.use(authenticate);

// GET /api/contacts - Pobierz wszystkie kontakty
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find({ owner: req.user._id });
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Server error: Error fetching contacts" });
  }
});

// GET /api/contacts/:id - Pobierz kontakt po ID
router.get("/:id", async (req, res) => {
  const contactId = req.params.id;

  try {
    const contact = await Contact.findOne({
      _id: contactId,
      owner: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json(contact);
  } catch (error) {
    console.error("Error fetching contact by ID:", error);
    res
      .status(500)
      .json({ message: "Server error: Error fetching contact by ID" });
  }
});

// POST /api/contacts - Dodaj nowy kontakt
router.post("/", async (req, res) => {
  const { name, email, phone, favorite } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newContact = new Contact({
      name,
      email,
      phone,
      favorite,
      owner: req.user._id,
    });
    const savedContact = await newContact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    console.error("Error saving new contact:", error);
    res.status(500).json({ message: "Server error: Error saving new contact" });
  }
});

// DELETE /api/contacts/:id - Usuń kontakt po ID
router.delete("/:id", async (req, res) => {
  const contactId = req.params.id;

  try {
    const deletedContact = await Contact.findOneAndDelete({
      _id: contactId,
      owner: req.user._id,
    });

    if (!deletedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ message: "Contact deleted" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: "Server error: Error deleting contact" });
  }
});

// PATCH /api/contacts/:id/favorite - Aktualizuj status ulubionego kontaktu
router.patch("/:id/favorite", async (req, res) => {
  const contactId = req.params.id;
  const { favorite } = req.body;

  if (favorite === undefined) {
    return res.status(400).json({ message: "Missing field favorite" });
  }

  try {
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: contactId, owner: req.user._id },
      { favorite },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json(updatedContact);
  } catch (error) {
    console.error("Error updating contact favorite status:", error);
    res.status(500).json({
      message: "Server error: Error updating contact favorite status",
    });
  }
});

module.exports = router;
