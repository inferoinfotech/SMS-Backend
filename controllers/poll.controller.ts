const Poll = require("../models/poll.model");
const PollResponse = require("../models/pollResponse.model");

// Create a new poll
const createPoll = async (req: any, res: any) => {
  try {
    const {
      pollType,
      question,
      description,
      society,
      options,
      allowMultipleAnswers,
      ratingScale,
      minValue,
      maxValue,
      unit,
      dueDate,
    } = req.body;

    if (!pollType || !question || !society) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const poll = await Poll.create({
      pollType,
      question,
      description,
      society,
      createdBy: req.user.id || req.user._id,
      options: options?.map((opt: any) =>
        typeof opt === "string" ? { text: opt } : opt,
      ),
      allowMultipleAnswers: allowMultipleAnswers || false,
      ratingScale: ratingScale || 5,
      minValue,
      maxValue,
      unit,
      dueDate,
    });

    const pollData = await Poll.findById(poll._id).select(
      "-__v -updatedAt -society -voters",
    );
    return res.status(201).json({ success: true, poll: pollData });
  } catch (error: any) {
    console.error("Create Poll Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all polls for a society
const getPoll = async (req: any, res: any) => {
  try {
    const { societyId, status } = req.query;

    if (!societyId) {
      return res
        .status(400)
        .json({ success: false, message: "Society ID is required" });
    }

    const filter: any = { society: societyId };
    if (status) filter.status = status;

    const polls = await Poll.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name firstname lastname profileImage")
      .select("-__v -updatedAt -society -voters");

    return res.status(200).json({ success: true, polls });
  } catch (error: any) {
    console.error("Get Poll Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Submit an answer/vote for a poll
const pollAnswer = async (req: any, res: any) => {
  try {
    const { pollId, optionIds, rating, numericValue, text, ranking } = req.body;
    const userId = req.user.id || req.user._id;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res
        .status(404)
        .json({ success: false, message: "Poll not found" });
    }

    // Check if poll is closed
    if (
      poll.status !== "Active" ||
      (poll.dueDate && new Date() > new Date(poll.dueDate))
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Poll is not active or has expired" });
    }

    // Check if user already voted
    const existingResponse = await PollResponse.findOne({
      poll: pollId,
      user: userId,
    });
    if (existingResponse) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You have already voted on this poll",
        });
    }

    // Process vote based on type
    const responseData: any = {
      poll: pollId,
      user: userId,
      responseType: poll.pollType,
    };

    if (poll.pollType === "Multichoice") {
      if (!optionIds || optionIds.length === 0)
        return res
          .status(400)
          .json({ success: false, message: "Select at least one option" });
      if (!poll.allowMultipleAnswers && optionIds.length > 1)
        return res
          .status(400)
          .json({ success: false, message: "Only one selection allowed" });

      responseData.choices = optionIds;
      // Legacy support: update votes array in Poll model
      optionIds.forEach((id: string) => {
        const option = poll.options.id(id);
        if (option) option.votes += 1;
      });
    } else if (poll.pollType === "Rating") {
      if (rating === undefined)
        return res
          .status(400)
          .json({ success: false, message: "Rating is required" });
      responseData.rating = rating;
    } else if (poll.pollType === "Numeric") {
      if (numericValue === undefined)
        return res
          .status(400)
          .json({ success: false, message: "Numeric value is required" });
      if (poll.minValue !== undefined && numericValue < poll.minValue)
        return res
          .status(400)
          .json({
            success: false,
            message: `Minimum value is ${poll.minValue}`,
          });
      if (poll.maxValue !== undefined && numericValue > poll.maxValue)
        return res
          .status(400)
          .json({
            success: false,
            message: `Maximum value is ${poll.maxValue}`,
          });
      responseData.numericValue = numericValue;
    } else if (poll.pollType === "Text") {
      if (!text)
        return res
          .status(400)
          .json({ success: false, message: "Response text is required" });
      responseData.text = text;
    } else if (poll.pollType === "Ranking") {
      if (!ranking || ranking.length !== poll.options.length)
        return res
          .status(400)
          .json({ success: false, message: "Rank all options" });
      responseData.ranking = ranking;
    }

    // Save response and update voters list in Poll for compatibility
    await PollResponse.create(responseData);
    poll.voters.push({
      user: userId,
      choices: optionIds || [],
      votedAt: new Date(),
    });
    await poll.save();

    return res
      .status(200)
      .json({ success: true, message: "Vote recorded successfully" });
  } catch (error: any) {
    console.error("Poll Answer Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get results for a poll
const getResults = async (req: any, res: any) => {
  try {
    const { pollId } = req.params;
    const poll = await Poll.findById(pollId)
      .populate("options")
      .select("-__v -updatedAt -society -voters");
    if (!poll)
      return res
        .status(404)
        .json({ success: false, message: "Poll not found" });

    const responses = await PollResponse.find({ poll: pollId })
      .populate("user", "name firstname lastname profileImage")
      .select("-__v -updatedAt");
    const totalResponses = responses.length;

    let result: any = { totalResponses };

    if (poll.pollType === "Multichoice") {
      result.options = poll.options.map((opt: any) => ({
        _id: opt._id,
        text: opt.text,
        votes: opt.votes,
        percentage:
          totalResponses > 0
            ? Math.round((opt.votes / totalResponses) * 100)
            : 0,
      }));
    } else if (poll.pollType === "Rating") {
      const sum = responses.reduce(
        (acc: number, r: any) => acc + (r.rating || 0),
        0,
      );
      result.averageRating =
        totalResponses > 0 ? (sum / totalResponses).toFixed(1) : 0;
    } else if (poll.pollType === "Numeric") {
      const values = responses
        .map((r: any) => r.numericValue)
        .filter((v: any) => v !== undefined);
      if (values.length > 0) {
        result.average = (
          values.reduce((a: any, b: any) => a + b, 0) / values.length
        ).toFixed(2);
        result.min = Math.min(...values);
        result.max = Math.max(...values);
      }
    } else if (poll.pollType === "Text") {
      result.responses = responses.map((r: any) => ({
        text: r.text,
        userName: r.user
          ? `${r.user.firstname} ${r.user.lastname}`
          : "Resident",
        votedAt: r.createdAt,
      }));
    } else if (poll.pollType === "Ranking") {
      const scores: Record<string, number> = {};
      poll.options.forEach((opt: any) => (scores[opt._id] = 0));

      responses.forEach((r: any) => {
        if (r.ranking) {
          r.ranking.forEach((optId: string, index: number) => {
            // Points: Rank 1 gets poll.options.length, Rank 2 gets length-1, etc.
            scores[optId] += poll.options.length - index;
          });
        }
      });

      result.rankedResults = poll.options
        .map((opt: any) => ({
          _id: opt._id,
          text: opt.text,
          score: scores[opt._id] || 0,
        }))
        .sort((a: any, b: any) => b.score - a.score);
    }

    return res.status(200).json({ success: true, poll, result });
  } catch (error: any) {
    console.error("Get Results Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update poll status
const updateStatus = async (req: any, res: any) => {
  try {
    const { pollId } = req.params;
    const { status } = req.body;
    const poll = await Poll.findByIdAndUpdate(
      pollId,
      { status },
      { new: true },
    );
    return res.status(200).json({ success: true, poll });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete poll
const deletePoll = async (req: any, res: any) => {
  try {
    const { pollId } = req.params;
    await Poll.findByIdAndDelete(pollId);
    await PollResponse.deleteMany({ poll: pollId });
    return res
      .status(200)
      .json({ success: true, message: "Poll deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPoll,
  getPoll,
  pollAnswer,
  getResults,
  updateStatus,
  deletePoll,
};
