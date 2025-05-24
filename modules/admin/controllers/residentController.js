const crypto = require('crypto');
const { Resident } = require("../models");
const { sendEmailToUser } = require('../../utils/sendEmailWithPassword');
const { residentSchema } = require('../joi');

exports.createResident = async (req, res) => {
  try {
    console.log("-------createResident-------");

    // Generate random password for the new resident
    const randomPassword = crypto.randomBytes(6).toString('hex');
    const hashedPassword = randomPassword;

    // Handle file uploads
    let uploadedFiles = req.files || {};
    const images = {
      profilePhoto: uploadedFiles.profilePhoto ? uploadedFiles.profilePhoto[0].filename : null,
      frontAadharCard: uploadedFiles.frontAadharCard ? uploadedFiles.frontAadharCard[0].filename : null,
      backAadharCard: uploadedFiles.backAadharCard ? uploadedFiles.backAadharCard[0].filename : null,
      addressProof: uploadedFiles.addressProof ? uploadedFiles.addressProof[0].filename : null,
      rentAgreement: uploadedFiles.rentAgreement ? uploadedFiles.rentAgreement[0].filename : null
    };

    const { wing, unit } = req.body;
    const societyId = req.society._id;

    // Check if unit is already occupied
    const existingOccupiedUnit = await Resident.findOne({
      wing,
      unit,
      society: societyId,
      isOccupied: true,
      isDeleted: false
    });

    if (existingOccupiedUnit) {
      return res.status(400).json({
        message: `Unit ${unit} in wing ${wing} is already occupied in this society.`
      });
    }

    // Mark any existing records for this unit as deleted
    await Resident.updateMany(
      { wing, unit, society: societyId, isDeleted: false },
      { isOccupied: false, isDeleted: true }
    );

    // Create new resident object
    const residentData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      age: req.body.age,
      gender: req.body.gender,
      wing: req.body.wing,
      unit: req.body.unit,
      relation: req.body.relation,
      owner: req.body.owner === 'true', // Convert string to boolean
      society: societyId,
      createdBy: req.admin._id,
      password: hashedPassword,
      images: images,
      members: req.body.members || [],
      vehicles: req.body.vehicles || [],
      isOccupied: true,
      isDeleted: false,
      role: 'resident'
    };

    // Create and save the new resident
    const resident = new Resident(residentData);
    const savedResident = await resident.save();

    // Send email with credentials if email is provided
    if (savedResident.email) {
      try {
        await sendEmailToUser(savedResident.email, randomPassword);
        console.log(`Password email sent to ${savedResident.email}`);
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        return res.status(500).json({ 
          message: 'Resident created, but failed to send email', 
          error: emailError 
        });
      }
    }

    res.status(201).json(savedResident);

  } catch (error) {
    console.error("Error creating resident:", error);
    res.status(500).json({ message: 'Error creating resident', error });
  }
};


exports.getAllResidents = async (req, res) => {
  try {
    const residents = await Resident.find({ society: req.society._id, isDeleted: false })
      .populate('society')
      .populate('createdBy');

    if (residents.length === 0) {
      return res.status(404).json({ message: 'No residents found' });
    }

    res.status(200).json(residents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching residents', error });
  }
};


exports.getResidentById = async (req, res) => {
  try {
    const resident = await Resident.findOne({ _id: req.params.id, isDeleted: false, society: req.society._id })
      .populate('society')
      .populate('createdBy');

    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    res.status(200).json(resident);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resident', error });
  }
};

exports.updateResident = async (req, res) => {
  try {
    console.log("-------updateResident-------");
    console.log("Request body:", req.body);

    const residentId = req.params.id;
    const { wing, unit } = req.body;
    const societyId = req.society._id;
    const updates = { ...req.body };

    // Handle members array
    if (req.body.members) {
      try {
        updates.members = JSON.parse(req.body.members);
        console.log("Parsed members:", updates.members);
      } catch (e) {
        console.error("Error parsing members:", e);
        return res.status(400).json({ message: "Invalid members data format" });
      }
    }

    // Handle vehicles array
    if (req.body.vehicles) {
      try {
        updates.vehicles = JSON.parse(req.body.vehicles);
        console.log("Parsed vehicles:", updates.vehicles);
      } catch (e) {
        console.error("Error parsing vehicles:", e);
        return res.status(400).json({ message: "Invalid vehicles data format" });
      }
    }

    // Handle file uploads
    const uploadedFiles = req.files || {};
    const images = {};

    if (uploadedFiles.profilePhoto) {
      images.profilePhoto = uploadedFiles.profilePhoto[0].filename;
    }
    if (uploadedFiles.frontAadharCard) {
      images.frontAadharCard = uploadedFiles.frontAadharCard[0].filename;
    }
    if (uploadedFiles.backAadharCard) {
      images.backAadharCard = uploadedFiles.backAadharCard[0].filename;
    }
    if (uploadedFiles.addressProof) {
      images.addressProof = uploadedFiles.addressProof[0].filename;
    }
    if (uploadedFiles.rentAgreement) {
      images.rentAgreement = uploadedFiles.rentAgreement[0].filename;
    }

    const existingResident = await Resident.findById(residentId);
    if (!existingResident || existingResident.isDeleted) {
      return res.status(404).json({ message: "Resident not found" });
    }

    // Check for wing/unit conflicts
    if (wing && unit && (wing !== existingResident.wing || unit !== existingResident.unit)) {
      const existingUnit = await Resident.findOne({
        wing,
        unit,
        society: societyId,
        isOccupied: true,
        isDeleted: false,
        _id: { $ne: residentId }
      });

      if (existingUnit) {
        return res.status(400).json({
          message: `Unit ${unit} in wing ${wing} is already occupied in this society.`,
        });
      }
    }

    // Merge existing and new images
    updates.images = { ...existingResident.images, ...images };
    updates.isOccupied = true;
    updates.isDeleted = false;

    console.log("Final updates object:", updates);

    const updatedResident = await Resident.findOneAndUpdate(
      { _id: residentId, isDeleted: false },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedResident) {
      return res.status(404).json({ message: "Resident not found" });
    }

    console.log("Updated Resident:", updatedResident);
    res.status(200).json(updatedResident);
  } catch (error) {
    console.error("Error updating resident:", error);
    res.status(500).json({ message: "Error updating resident", error });
  }
};

exports.deleteResident = async (req, res) => {
  const { error } = residentSchema.validate(req.body)
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  try {
    const resident = await Resident.findOne({ isDeleted: false, wing: req.body.wing, unit: req.body.unit });
    if (!resident) {
      return res.status(404).json({ message: "Resident not found" });
    }

    resident.isDeleted = true;
    resident.isOccupied = false;

    const updatedResident = await resident.save();

    res.status(200).json({ message: "Resident deleted successfully", resident: updatedResident });
  } catch (error) {
    console.error("Error deleting resident:", error);
    res.status(500).json({ message: "Error deleting resident", error });
  }
};