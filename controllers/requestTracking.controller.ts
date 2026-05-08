const RequestTracking = require("../models/requestTracking.model");

const createRequestTracking = async function name(req: any, res: any) {
  try {
    const { requesterName, requestName, wing, unit, description, status, priority } =
      req.body;

    if (
      !requesterName ||
      !requestName ||
      !wing ||
      !unit ||
      !status ||
      !priority
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const requestTracking = await RequestTracking.create({
      requesterName,
      requestName,
      wing,
      unit,
      description,
      status,
      priority,
    });
    res.status(201).json({ requestTracking });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const editRequestTracking = async function name(req: any, res: any) {
  try {
    const id = req.params.id;
    const { requesterName, requestName, wing, unit, description, status, priority } = req.body;

    const updateRequestTracking = await RequestTracking.findByIdAndUpdate(
      id,
      {
        requesterName,
        requestName,
        wing,
        unit,
        description,
        status,
        priority,
      },
      { new: true },
    );

    if (!updateRequestTracking) {
      return res.status(404).json({ message: "RequestTracking not found" });
    }
    res.status(200).json({ updateRequestTracking });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const deleteRequestTracking = async function name(req: any, res: any) {
  try {
    const id = req.params.id;
    const deleteRequestTracking = await RequestTracking.findByIdAndDelete(id);
    if (!deleteRequestTracking) {
      return res.status(404).json({ message: "RequestTracking not found" });
    }
    res.status(200).json({ deleteRequestTracking });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getAllRequestTracking = async function name(req: any, res: any) {
  try {
    const requestTrackingList = await RequestTracking.find();
    if (!requestTrackingList) {
      return res.status(404).json({ message: "RequestTracking not found" });
    }
    res.status(200).json({ requestTrackingList });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRequestTracking,
  editRequestTracking,
  deleteRequestTracking,
  getAllRequestTracking,
};
