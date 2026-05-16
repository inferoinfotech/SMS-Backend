import { StreamClient } from "@stream-io/node-sdk";
import { Request, Response } from "express";

const apiKey = process.env.STREAM_API_KEY!;
const secret = process.env.STREAM_SECRET!;

// Use the Stream Video Node SDK for proper user management and token generation
const client = apiKey && secret ? new StreamClient(apiKey, secret) : null;

export const generateToken = async (req: Request, res: Response) => {
  try {
    let { userId, userName, userImage } = req.body;
    userId = String(userId || "").trim();

    if (!client) {
      return res.status(400).json({
        success: false,
        message: "Stream Video is not configured. Add STREAM_API_KEY and STREAM_SECRET to .env",
      });
    }

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    // Upsert the user into Stream so they can be found and rung
    try {
      await client.upsertUsers([
        {
          id: userId,
          name: userName || userId,
          ...(userImage ? { image: userImage } : {}),
          role: "user",
        },
      ]);
    } catch (upsertErr: any) {
      // Non-fatal: log but continue - token can still be generated
      console.warn("[video.controller] upsertUsers warning:", upsertErr?.message);
    }

    // Generate a token — correct method is createToken(userId, expiry?)
    const expiry = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
    const token = client.createToken(userId, expiry);

    if (!token) {
      throw new Error("Token generation returned empty value");
    }

    console.log("[video.controller] Token generated for user:", userId);
    return res.status(200).json({ success: true, token });
  } catch (error: any) {
    console.error("[video.controller] generateToken error:", error?.message || error);
    return res.status(500).json({ success: false, message: "Token generation failed" });
  }
};