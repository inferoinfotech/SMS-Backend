
import { StreamChat } from "stream-chat";
import { Request, Response } from "express";

const serverClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY!,
  process.env.STREAM_SECRET!
);

export const generateToken = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.body;

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