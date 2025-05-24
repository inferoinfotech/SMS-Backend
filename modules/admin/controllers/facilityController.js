const { Facility } = require("../models");

exports.createFacility = async (req, res, next) => {
  try {
    const { name, description, serviceDate, remindBeforeDate } = req.body;

    const residentId = req.body.residentId;
    const society = req.society._id;
    const createdBy = req.admin._id;

    const facility = new Facility({
      name,
      description,
      serviceDate,
      remindBeforeDate,
      residentId,
      society,
      createdBy,
    });

    await facility.save();
    res.status(201).json(facility);
  } catch (err) {
    console.error("Error creating facility:", err);
    res.status(400).json({ error: err.message });
  }
};

exports.getFacilities = async (req, res, next) => {
  try {
    const facilities = await Facility.find({society: req.society._id,isDeleted: false })
      .populate("residentId", "name email")
      .populate("society", "name location")
      .populate("createdBy", "name email");

    if (facilities.length === 0) {
      return res.status(404).json({ error: "No facilities found" });
    }

    res.json(facilities);
  } catch (err) {
    console.error("Error fetching facilities:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );

    if (!facility) {
      return res.status(404).json({ error: "Facility not found" });
    }

    res.json(facility);
  } catch (err) {
    console.error("Error updating facility:", err);
    res.status(400).json({ error: err.message });
  }
};

exports.deleteFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!facility) {
      return res.status(404).json({ error: "Facility not found" });
    }

    res.json({ message: "Facility deleted", facility });
  } catch (err) {
    console.error("Error deleting facility:", err);
    res.status(400).json({ error: err.message });
  }
};