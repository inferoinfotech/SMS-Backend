const { Resident } = require("../../admin/models");

exports.getAllResidents = async (req, res) => {
  try {
    // Fetch residents with specific fields
    const residents = await Resident.find( { society:req.society._id, isDeleted: false } )
      .select('_id firstName lastName phoneNumber email images.profilePhoto owner wing unit');

    // Format the response
    const formattedResidents = residents.map(resident => ({
      profilePhoto: resident.images?.profilePhoto || null,
      _id: resident._id,
      owner: resident.owner,
      firstName: resident.firstName,
      lastName: resident.lastName,
      phoneNumber: resident.phoneNumber,
      email: resident.email,
      wing: resident.wing,
      unit: resident.unit,
    }));

    // Send the formatted response
    res.status(200).json(formattedResidents);
  } catch (error) {
    console.error('Error fetching residents:', error);
    res.status(500).json({ message: 'Error fetching residents', error });
  }
};
