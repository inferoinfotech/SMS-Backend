const { Society } = require('../models');

exports.createSociety = async (req, res, next) => {
  const { name, address, country, state, city, zipCode } = req.body;

  try {
    if (!name || !address || !country || !state || !city || !zipCode) {

      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const society = await Society.create({
      name,
      address,
      country,
      state,
      city,
      zipCode
    });

    res.status(201).json({
      success: true,
      data: society
    });

  } catch (error) {
    next(error);
  }
};

exports.getSocieties = async (req, res, next) => {
  try {
    const societies = await Society.find();
    res.status(200).json({
      success: true,
      data: societies
    });
  } catch (error) {
    next(error);
  }
};

exports.getSocietyById = async (req, res, next) => {
  try {
    const societyId = req.params.id;
    const society = await Society.findById(societyId);

    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    res.status(200).json({
      success: true,
      data: society
    });
  } catch (error) {
    next(error);
  }
};