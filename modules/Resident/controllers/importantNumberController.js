const { ImportantNumber } = require("../../admin/models");

exports.getImportantNumbers = async (req, res) => {
  try {
    const numbers = await ImportantNumber.find( { society:req.society._id, isDeleted: false } )
      .populate('society')
      .populate('createdBy');

    if (numbers.length === 0) {
      return res.status(404).json({ message: 'No important numbers found' });
    }

    res.status(200).json({
      status: 'success',
      data: numbers,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

