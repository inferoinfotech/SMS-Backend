import { Request, Response } from "express";
const { razorpay } = require("../config/razorpay");
const crypto = require("crypto");
const Maintenance = require("../models/maintenance");

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // convert to paisa
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Order creation failed",
    });
  }
};



export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const { recordId } = req.body;
      if (recordId) {
        await Maintenance.findByIdAndUpdate(recordId, {
          status: "Paid",
          payment: "Online",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Payment verified & record updated",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid signature",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};
module.exports = { createOrder ,verifyPayment};


