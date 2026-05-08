const Announcement = require("../models/announcement.model");

const createAnnouncement = async function (req: any, res: any) {
  try {
    const { title, description, announcementType, date, time } = req.body;
    if (!title || !description || !announcementType) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const announcement = await Announcement.create({
      title,
      description,
      announcementType,
      date,
      time,
    });
        res.status(201).json({ announcement });
    } catch (error:any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

const editAnnouncement = async function(req:any, res:any) {
    try {
        const id = req.params.id;
        const { title, description,announcementType,date,time  } = req.body;
        const announcement = await Announcement.findByIdAndUpdate(id, {
            title,
            description,
            announcementType,
            date,
            time,
        }, { new: true });
        res.status(200).json({ announcement });
    } catch (error:any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

const deleteAnnouncement = async function(req:any, res:any) {
    try {
        const id = req.params.id;
        const announcement = await Announcement.findByIdAndDelete(id);
        res.status(200).json({ announcement });
    } catch (error:any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

const getAllAnnouncement = async function(req:any, res:any) {
    try {
        const announcement = await Announcement.find();
        res.status(200).json({ announcement });
    } catch (error:any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createAnnouncement,
    editAnnouncement,
    deleteAnnouncement,
    getAllAnnouncement,
};