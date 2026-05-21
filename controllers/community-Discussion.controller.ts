const {
  CommunityDiscussion,
  DiscussionAnswer,
} = require("../models/community-discussion.model");

const createDiscussion = async (req: any, res: any) => {
  try {
    const { title, question, content, description, society } = req.body;

    const discussion = new CommunityDiscussion({
      question: question || title,
      description: description || content,
      society: society || req.user.society,
      user: req.user.id,
    });

    await discussion.save();
    return res.status(201).json({
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
    const society = req.user.society || req.query.societyId;

    // Fetch discussions
    const discussions = await CommunityDiscussion.find({ society })
      .populate("user", "firstname lastname profileImage")
      .select("-__v -updatedAt -society")
      .sort({ createdAt: -1 });

    // Map discussions to include answersCount
    const discussionsWithCounts = await Promise.all(
      discussions.map(async (d: any) => {
        const answersCount = await DiscussionAnswer.countDocuments({
          discussionId: d._id,
        });
        return {
          ...d.toObject(),
          answersCount,
          title: d.question,
          content: d.description,
        };
      }),
    );

    return res
      .status(200)
      .json({ success: true, discussions: discussionsWithCounts });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAnswers = async (req: any, res: any) => {
  try {
    const { discussionId } = req.body;
    const answers = await DiscussionAnswer.find({ discussionId })
      .populate("author", "firstname lastname profileImage")
      .select("-__v -updatedAt")
      .sort({ createdAt: 1 });

    return res.status(200).json({ success: true, answers });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createAnswer = async (req: any, res: any) => {
  try {
    const { discussionId, content } = req.body;
    if (!discussionId || !content) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const answer = new DiscussionAnswer({
      discussionId,
      content,
      author: req.user.id,
    });

    await answer.save();

    const populatedAnswer = await DiscussionAnswer.findById(
      answer._id,
    ).populate("author", "firstname lastname profileImage");

    return res.status(201).json({
      success: true,
      message: "Answer created successfully",
      answer: populatedAnswer,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const toggleVoteDiscussion = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const discussion = await CommunityDiscussion.findById(id);
    if (!discussion) {
      return res
        .status(404)
        .json({ success: false, message: "Discussion not found" });
    }

    const isVoted = discussion.votes.includes(userId);
    if (isVoted) {
      discussion.votes = discussion.votes.filter(
        (v: any) => v && v.toString() !== userId.toString(),
      );
    } else {
      discussion.votes.push(userId);
    }

    await discussion.save();
    return res.status(200).json({
      success: true,
      votesCount: discussion.votes.length,
      isVoted: !isVoted,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getDiscussionById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    // Check if the discussion exists and if the user has already viewed it
    let discussionDoc = await CommunityDiscussion.findById(id);
    if (!discussionDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Discussion not found" });
    }

    const viewersList = discussionDoc.viewers || [];
    const hasViewed = viewersList.some(
      (v: any) => v && v.toString() === userId.toString(),
    );

    let discussion;
    if (!hasViewed) {
      discussion = await CommunityDiscussion.findByIdAndUpdate(
        id,
        {
          $addToSet: { viewers: userId },
          $inc: { views: 1 },
        },
        { new: true },
      )
        .populate("user", "firstname lastname profileImage")
        .select("-__v -updatedAt -society");
    } else {
      discussion = await CommunityDiscussion.findById(id)
        .populate("user", "firstname lastname profileImage")
        .select("-__v -updatedAt -society");
    }

    const answers = await DiscussionAnswer.find({ discussionId: id })
      .populate("author", "firstname lastname profileImage")
      .select("-__v -updatedAt")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      discussion: {
        ...discussion.toObject(),
        title: discussion.question,
        content: discussion.description,
      },
      answers,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const toggleVoteAnswer = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const answer = await DiscussionAnswer.findById(id);
    if (!answer) {
      return res
        .status(404)
        .json({ success: false, message: "Answer not found" });
    }

    const isVoted = answer.votes.includes(userId);
    if (isVoted) {
      answer.votes = answer.votes.filter(
        (v: any) => v && v.toString() !== userId.toString(),
      );
    } else {
      answer.votes.push(userId);
    }

    await answer.save();
    return res.status(200).json({
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
