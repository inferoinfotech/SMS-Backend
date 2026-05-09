const { ZodError } = require("zod");

const validate = (schema:any ) => (req:any, res:any, next:any) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error:any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: (error.errors || error.issues || []).map((err: any) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    next(error);
  }
};

module.exports = validate;
