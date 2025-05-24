const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (amount, receiptId) => {
  try {
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: receiptId,
    };
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Unable to create Razorpay order');
  }
};
