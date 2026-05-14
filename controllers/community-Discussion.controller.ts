const {
  CommunityDiscussion,
  DiscussionAnswer,
} = require("../models/community-discussion.model");

const createDiscussion = async (req: any, res: any) => {
  try {
    const { question, description, society, user } = req.body;
    const discussion = new CommunityDiscussion({
      question,
      description,
      society,
      user,
    });
    await discussion.save();
    return res
      .status(201)
      .json({
        success: true,
        message: "Discussion created successfully",
        discussion,
      });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
const getAllDiscussions = async (req: any, res: any) => {
  try {
    const society = req.user.society;
    const discussions = await CommunityDiscussion.find({ society }).populate(
      "user",
      "firstname lastname profileImage",
    );
    if (!discussions) {
      return res
        .status(404)
        .json({ success: false, message: "No discussions found" });
    }
    return res.status(200).json({ success: true, discussions });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAnswers = async (req: any, res: any) => {
  try {
    const { discussionId } = req.body;
    const answers = await DiscussionAnswer.find({ discussionId }).populate(
      "author",
      "firstname lastname profileImage",
    );
    if (!answers) {
      return res
        .status(404)
        .json({ success: false, message: "No answers found" });
    }
    return res.status(200).json({ success: true, answers });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createAnswer = async (req: any, res: any) => {
  try {
    const { discussionId, content, author } = req.body;
    const answer = new DiscussionAnswer({ discussionId, content, author });
    await answer.save();
    return res
      .status(201)
      .json({ success: true, message: "Answer created successfully", answer });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
// 1. Toggle Vote for a Discussion
const toggleVoteDiscussion = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const discussion = await CommunityDiscussion.findById(id);
    if (!discussion)
      return res
        .status(404)
        .json({ success: false, message: "Discussion not found" });

    const isVoted = discussion.votes.includes(userId);

    if (isVoted) {
      // Unvote
      discussion.votes = discussion.votes.filter(
        (v: any) => v.toString() !== userId.toString(),
      );
    } else {
      // Vote
      discussion.votes.push(userId);
    }

    await discussion.save();
    return res
      .status(200)
      .json({
        success: true,
        votesCount: discussion.votes.length,
        isVoted: !isVoted,
      });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get Single Discussion with Details
const getDiscussionById = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // Find discussion and increment views
    const discussion = await CommunityDiscussion.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true },
    ).populate("user", "firstname lastname profileImage");

    if (!discussion)
      return res
        .status(404)
        .json({ success: false, message: "Discussion not found" });

    // Get all answers for this discussion
    const answers = await DiscussionAnswer.find({ discussionId: id })
      .populate("author", "firstname lastname profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, discussion, answers });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const toggleVoteAnswer = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const answer = await DiscussionAnswer.findById(id);
    if (!answer)
      return res
        .status(404)
        .json({ success: false, message: "Answer not found" });

    const isVoted = answer.votes.includes(userId);

    if (isVoted) {
      answer.votes = answer.votes.filter(
        (v: any) => v.toString() !== userId.toString(),
      );
    } else {
      answer.votes.push(userId);
    }

    await answer.save();
    return res
      .status(200)
      .json({
        success: true,
        votesCount: answer.votes.length,
        isVoted: !isVoted,
      });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createDiscussion,
  getAllDiscussions,
  getAnswers,
  createAnswer,
  toggleVoteDiscussion,
  getDiscussionById,
  toggleVoteAnswer,
};
