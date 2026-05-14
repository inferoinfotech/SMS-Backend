
import { StreamChat } from "stream-chat";
import { Request, Response } from "express";

const streamApiKey = process.env.STREAM_API_KEY;
const streamSecret = process.env.STREAM_SECRET;

const serverClient = (streamApiKey && streamSecret) 
  ? StreamChat.getInstance(streamApiKey, streamSecret)
  : null;

export const generateToken = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.body;

    if (!serverClient) {
      return res.status(400).json({
        success: false,
        message: "Stream Video is not configured on the server. Please add STREAM_API_KEY and STREAM_SECRET to .env",
      });
    }

    const token = serverClient.createToken(userId);

    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Token generation failed",
    });
  }
};