const Resident = require("../models/resident.model");
const logger = require("../config/logger");

const createResident = async (req: any, res: any) => {
  try {
    const {
      name,
      email,
      age,
      gender,
      wing,
      unit,
      phoneNumber,
      address,
      profileImage,
      relation,
      uploadAadharfront,
      uploadAadharback,
      uploadPan,
      addressProof,
      rentAgreeMent,
      members,
      memberCount,
      vehicles,
      residentStatus,
      unitStatus,
    } = req.body;

    if (!wing || !unit || !unitStatus || !residentStatus) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const existing = await Resident.findOne({ wing, unit });
    if (existing) {
      return res.status(400).json({
        message: "Resident already exists in this unit",
      });
    }

    //  VACANT
    if (unitStatus === "Vacant") {
      const newresident = await Resident.create({
        wing,
        unit,
        unitStatus: "Vacant",
      });

      return res.status(201).json({
        message: "Unit marked as vacant",
        data: newresident,
      });
    }

    //  OCCUPIED
    if (unitStatus === "Occupied") {
      if (!name || !phoneNumber) {
        return res.status(400).json({
          message: "Name and phone required",
        });
      }

      const newResident = await Resident.create({
        name,
        email,
        age,
        gender,
        wing,
        unit,
        phoneNumber,
        address,
        profileImage,
        relation,
        uploadAadharfront,
        uploadAadharback,
        uploadPan,
        addressProof,
        rentAgreeMent,
        members: members || [],
        memberCount: members ? members.length : 1,
        vehicles: vehicles || [],
        residentStatus,
        unitStatus,
      });

      return res.status(201).json({
        message: "Resident created successfully",
        data: newResident,
      });
    }

    return res.status(400).json({
      message: "Invalid unitStatus",
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getAllResidents = async (req: any, res: any) => {
  try {
    const residents = await Resident.find();
    console.log(residents, "residents");
    return res.status(200).json(residents);
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: error });
  }
};

module.exports = { createResident, getAllResidents };
