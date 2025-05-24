const mongoose = require('mongoose');
const crypto = require('crypto');

// Define a schema for ZegoToken
const ZegoTokenSchema = new mongoose.Schema({
    token: String,
    userID: String,
    userName: String,
    roomID: String,
    action: String,
    createdAt: { type: Date, default: Date.now },
});

// Create a model from the schema
const ZegoTokenModel = mongoose.model('ZegoToken', ZegoTokenSchema);

// Logic to generate token and save it to the database
class ZegoToken {
    static async generateToken(userID, roomID, action, userName) {
        // Generate token (mock)
        const token = crypto.randomBytes(16).toString('hex');

        // Save token data to the database
        const zegoTokenData = new ZegoTokenModel({
            token,
            userID,
            userName,
            roomID,
            action,
        });

        try {
            // Save to the database and return the token
            await zegoTokenData.save();
            return token;
        } catch (error) {
            console.error('Error saving token to database:', error);
            throw new Error('Error saving token to database');
        }
    }
}

module.exports = ZegoToken;
