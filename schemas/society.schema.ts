const { z } = require("zod");

const createSocietySchema = z.object({
  societyName: z.string().min(1, "Society name is required"),
  societyAddress: z.string().min(1, "Society address is required"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "Zip code must be at least 5 characters"),
});

module.exports = {
  createSocietySchema,
};
