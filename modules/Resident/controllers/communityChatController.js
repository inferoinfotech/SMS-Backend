const GroupChat = require("../models/CommunityChat");
const { default: mongoose } = require("mongoose");

exports.getAllGroups = async (req, res) => {
    try {
        const groups = await GroupChat.find({});
        res.status(200).json(groups);
    } catch (error) {
        console.error("Error retrieving groups:", error);
        res.status(500).json({ message: "Failed to retrieve groups" });
    }
};


exports.createGroup = async (req, res) => {
    try {
        const { groupName } = req.body;
        // const allResidents = await Resident.find({});
        // const residentsMembers = allResidents.map((resident) => ({
        //   _id: resident._id,
        // }));

        // const allMembers = [...residentsMembers];/

        const newGroupChat = new GroupChat({
            groupName,
            // groupMembers: allMembers,
            // messages: [],
        });

        await newGroupChat.save();

        res.status(201).json({
            message: "Group chat created successfully",
            group: newGroupChat,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create group chat" });
    }
};

exports.askQuestion = async (req, res) => {
    const { groupId, questionText, askedBy } = req.body;
    try {
        const groupChat = await GroupChat.findById(groupId);
        if (!groupChat) {
            return res.status(404).json({ error: "Group not found" });
        }

        const newQuestion = {
            _id: new mongoose.Types.ObjectId(),
            questionText,
            askedBy,
            createdAt: new Date(),
            answers: [],
        };

        groupChat.questions.push(newQuestion);
        await groupChat.save();

        res.status(200).json(newQuestion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to post question" });
    }
};

exports.answerQuestion = async (req, res) => {
    const { groupId, questionId, answeredBy, answerText } = req.body;

    try {
        const groupChat = await GroupChat.findById(groupId);
        if (!groupChat) {
            return res.status(404).json({ error: "Group not found" });
        }

        const question = groupChat.questions.id(questionId);
        if (!question) {
            return res.status(404).json({ error: "Question not found" });
        }

        const newAnswer = {
            answeredBy,
            answerText,
            createdAt: new Date(),
        };

        question.answers.push(newAnswer);
        await groupChat.save();

        res.status(200).json({ message: "Answer posted successfully", newAnswer });
    } catch (error) {
        res.status(500).json({ message: "Failed to post answer" });
    }
};

exports.getGroupQuestions = async (req, res) => {
    const { groupId } = req.params;

    try {
        const groupChat = await GroupChat.findById(groupId);

        if (!groupChat) {
            return res.status(404).json({ error: "Group not found" });
        }

        res.status(200).json({ questions: groupChat.questions });
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve questions and answers" });
    }
};
