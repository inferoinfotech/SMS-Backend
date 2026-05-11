const Announcement = require("../models/announcement.model");

const createAnnouncement = async function (req: any, res: any) {
  try {
    const { title, description, announcementType, date, time,society  } = req.body;
    if (!title || !description || !announcementType || !society) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const announcement = await Announcement.create({
      title,
      description,
      announcementType,
      date,
      time,
      society
    });
    const io = req.app.get("io");
    io.emit("notification", {
      title: "New Announcement",
      message: `A new announcement "${announcement.title}" has been posted.`,
      type: "info",
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
    const io = req.app.get("io");
    io.emit("notification", {
      title: "Announcement Updated",
      message: `Announcement "${announcement.title}" has been updated.`,
      type: "info",
    });

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
        const societyId = req.query.societyId;
        const targetSociety = req.user.society || societyId;
        const announcement = await Announcement.find({ society:targetSociety });
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