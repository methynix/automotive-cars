export const validate = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.parseAsync(req.body);
    return next();
  } catch (err) {
    return res.status(400).json({ success: false, errors: err.errors || err.message });
  }
};
