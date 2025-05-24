const { Poll } = require('../models');
const { Resident } = require('../../admin/models');

exports.createPoll = async (req, res) => {
  try {
    if (!req.resident || !req.resident._id) {
      return res.status(401).json({ error: 'Unauthorized. Resident not found.' });
    }

    const { pollType, question, options } = req.body;

    // Basic validation
    if (!pollType || !question) {
      return res.status(400).json({ error: 'Poll type and question are required.' });
    }

    // Validate options based on poll type
    if (pollType === 'Text') {
      // For text polls, options array can be empty or contain a single placeholder
      if (!options) {
        options = []; // Set default empty array for text polls
      }
    } else {
      // For all other poll types, require at least 2 options
      if (!options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ error: 'Invalid poll data. At least two options are required for this poll type.' });
      }
    }

    const residents = await Resident.find({ society: req.society }).select('_id');
    if (!residents || residents.length === 0) {
      return res.status(400).json({ error: 'No residents found to share the poll.' });
    }

    const responses = residents.map((resident) => ({
      residentId: resident._id,
      selectedOption: null,
    }));

    const newPoll = new Poll({
      pollType,
      question,
      options,
      residentId: req.resident._id, // Creator of the poll
      responses, // Add all residents as recipients
    });

    await newPoll.save();

    // Optionally notify residents (implement your notification logic here)
    console.log(`Poll "${newPoll.question}" shared with ${residents.length} residents.`);

    res.status(201).json({
      message: 'Poll created and shared successfully.',
      poll: newPoll,
    });
  } catch (error) {
    console.error('Error creating poll:', error.message);
    res.status(500).json({ error: 'Error creating poll', details: error.message });
  }
};

exports.getOwnPolls = async (req, res) => {
  try {
    if (!req.resident || !req.resident._id) {
      return res.status(401).json({ error: 'Unauthorized. Resident not found.' });
    }

    const residentId = req.resident._id;

    // Fetch polls for the current resident and populate required fields
    const ownPolls = await Poll.find({ residentId })
      .populate('residentId', 'firstName lastName images.profilePhoto')
      .populate('responses.residentId', 'firstName lastName images.profilePhoto')
      .exec();

    // Check if no polls were found
    if (!ownPolls || ownPolls.length === 0) {
      return res.status(404).json({ message: 'No polls found for the current resident.' });
    }

    // Process each poll to count responses for each option
    const pollsWithCounts = ownPolls.map((poll) => {
      const optionCounts = poll.options.map((option) => {
        const count = poll.responses.filter((response) => {
          if (poll.pollType === 'MultiChoice') {
            return response.selectedOption === option;
          } else {
            return response.selectedOption === option;
          }
        }).length;

        return { option, count };
      });

      return {
        ...poll.toObject(),
        optionCounts,
      };
    });

    return res.status(200).json({
      message: 'Own polls fetched successfully.',
      polls: pollsWithCounts,
    });
  } catch (error) {
    console.error('Error fetching own polls:', error.message);
    return res.status(500).json({ error: 'Error fetching own polls', details: error.message });
  }
};

// Fetch polls from other residents
exports.getOtherResidentsPolls = async (req, res) => {
  try {
    if (!req.resident || !req.resident._id) {
      return res.status(401).json({ error: 'Unauthorized. Resident not found.' });
    }

    const residentId = req.resident._id;

    // Pagination and sorting parameters
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
    const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;

    // Fetch polls excluding the logged-in resident's polls
    const otherPolls = await Poll.find({ residentId: { $ne: residentId }, society:req.society._id })
      .populate('residentId', 'firstName lastName images.profilePhoto')
      .populate({
        path: 'responses.residentId',
        select: 'images.profilePhoto',
      })
      .sort({ [sortBy]: sortOrder }) // Dynamic sorting
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .exec();

    if (otherPolls.length === 0) {
      return res.status(404).json({ message: 'No polls found from other residents.' });
    }

    // Add counts for each option in each poll
    const pollsWithCounts = otherPolls.map((poll) => {
      const optionCounts = poll.options?.map((option) => {
        const count = poll.responses.filter((response) => response.selectedOption === option).length;
        return { option, count };
      }) || [];

      return {
        ...poll.toObject(),
        optionCounts,
      };
    });

    return res.status(200).json({
      message: 'Polls from other residents fetched successfully',
      currentPage: parseInt(page, 10),
      totalPolls: otherPolls.length,
      polls: pollsWithCounts,
    });
  } catch (error) {
    console.error('Error fetching other residents polls:', error);
    return res.status(500).json({ error: 'Error fetching other residents polls', details: error.message });
  }
};

// Fetch all previous polls (own + others)
exports.getAllPreviousPolls = async (req, res) => {
  try {
    if (!req.resident || !req.resident._id) {
      return res.status(401).json({ error: 'Unauthorized. Resident not found.' });
    }

    // Pagination and sorting parameters
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
    const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;

    // Fetch all polls
    const allPolls = await Poll.find({ society:req.society._id })
      .populate('residentId', 'firstName lastName images.profilePhoto')
      .sort({ [sortBy]: sortOrder }) // Dynamic sorting
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .exec();

    if (allPolls.length === 0) {
      return res.status(404).json({ message: 'No polls found.' });
    }

    return res.status(200).json({
      message: 'Previous polls fetched successfully',
      currentPage: parseInt(page, 10),
      totalPolls: allPolls.length,
      polls: allPolls,
    });
  } catch (error) {
    console.error('Error fetching previous polls:', error);
    return res.status(500).json({ error: 'Error fetching previous polls', details: error.message });
  }
};


exports.submitPollResponse = async (req, res) => {
  try {
    const { pollId, selectedOption } = req.body;
    const residentId = req.resident._id;

    // Initial validation
    if (!pollId || selectedOption === undefined) {
      return res.status(400).json({ error: 'Poll ID and selected option are required' });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Find existing response index
    const existingResponseIndex = poll.responses.findIndex(
      response => response.residentId.toString() === residentId.toString()
    );

    // Handle validation and response based on poll type
    if (poll.pollType === 'Multichoice') {
      // Ensure selectedOption is an array
      const optionsArray = Array.isArray(selectedOption) ? selectedOption : [selectedOption];

      // Validate all options exist in poll options
      const invalidOptions = optionsArray.filter(option => !poll.options.includes(option));
      if (invalidOptions.length > 0) {
        return res.status(400).json({ error: 'Invalid options selected' });
      }

      // For Multichoice, create separate response entries for each selected option
      if (existingResponseIndex !== -1) {
        // Remove existing responses for this resident
        poll.responses = poll.responses.filter(
          response => response.residentId.toString() !== residentId.toString()
        );
      }

      // Add new responses for each selected option
      optionsArray.forEach(option => {
        poll.responses.push({
          residentId: residentId,
          selectedOption: option
        });
      });

    } else if (poll.pollType === 'Text') {
      // Ensure selectedOption is a string
      if (typeof selectedOption !== 'string') {
        return res.status(400).json({ error: 'Text response must be a string' });
      }

      // Trim and validate the text response
      const trimmedResponse = selectedOption.trim();
      if (trimmedResponse === '') {
        return res.status(400).json({ error: 'Text response cannot be empty' });
      }

      // Update or add single response
      if (existingResponseIndex !== -1) {
        poll.responses[existingResponseIndex].selectedOption = trimmedResponse;
      } else {
        poll.responses.push({ residentId, selectedOption: trimmedResponse });
      }

    } else {
      // Single choice poll types
      if (!poll.options.includes(selectedOption)) {
        return res.status(400).json({ error: 'Invalid option selected' });
      }
      // Update or add single response
      if (existingResponseIndex !== -1) {
        poll.responses[existingResponseIndex].selectedOption = selectedOption;
      } else {
        poll.responses.push({ residentId, selectedOption });
      }
    }

    await poll.save();

    res.status(200).json({
      message: 'Poll response submitted successfully',
      response: {
        pollId,
        selectedOption: poll.pollType === 'Multichoice' ?
          poll.responses
            .filter(r => r.residentId.toString() === residentId.toString())
            .map(r => r.selectedOption) :
          selectedOption
      }
    });

  } catch (error) {
    console.error('Error submitting poll response:', error);
    res.status(500).json({ error: 'Error submitting poll response', details: error.message });
  }
};