const Poll = require("../models/poll.model");

// Create a new poll
const createPoll = async (req: any, res: any) => {
  try {
    const { pollType, question, society, options, allowMultipleAnswers, ratingScale, dueDate } = req.body;

    if (!pollType || !question || !society) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const poll = await Poll.create({
      pollType,
      question,
      society,
      createdBy: req.user.id || req.user._id,
      options,
      allowMultipleAnswers: allowMultipleAnswers || false,
      ratingScale: ratingScale || 5,
      dueDate,
    });

    return res.status(201).json({ success: true, poll });
  } catch (error: any) {
    console.error("Create Poll Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all polls for a society
const getPoll = async (req: any, res: any) => {
  try {
    const { societyId } = req.query; // Use query for GET requests

    if (!societyId) {
      return res.status(400).json({ success: false, message: "Society ID is required" });
    }

    const polls = await Poll.find({ society: societyId })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name firstname lastname profileImage");

    return res.status(200).json({ success: true, polls });
  } catch (error: any) {
    console.error("Get Poll Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Submit an answer/vote for a poll
const pollAnswer = async (req: any, res: any) => {
  try {
    const { pollId, optionIds } = req.body; // optionIds should be an array for multiselect
    const userId = req.user.id || req.user._id;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ success: false, message: "Poll not found" });
    }

    // Check if poll is closed
    if (poll.status === "Closed" || (poll.dueDate && new Date() > new Date(poll.dueDate))) {
      return res.status(400).json({ success: false, message: "Poll is already closed or expired" });
    }

    // Check if user already voted
    const alreadyVoted = poll.voters.find((v: any) => v.user.toString() === userId.toString());
    if (alreadyVoted) {
      return res.status(400).json({ success: false, message: "You have already voted on this poll" });
    }

    // Validation for multiselect
    if (!poll.allowMultipleAnswers && optionIds.length > 1) {
      return res.status(400).json({ success: false, message: "This poll only allows a single selection" });
    }

    // Update votes for selected options
    optionIds.forEach((id: string) => {
      const option = poll.options.id(id);
      if (option) {
        option.votes += 1;
      }
    });

    // Add user to voters list
    poll.voters.push({
      user: userId,
      choices: optionIds,
      votedAt: new Date(),
    });

    await poll.save();

    return res.status(200).json({ success: true, message: "Vote recorded successfully", poll });
  } catch (error: any) {
    console.error("Poll Answer Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createPoll, getPoll, pollAnswer };
