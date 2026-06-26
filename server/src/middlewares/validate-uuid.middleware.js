import { validate as isUuid } from 'uuid';

export const validateUUID = (paramName = 'id') => (req, res, next) => {
  const value = req.params[paramName];
  if (!value || !isUuid(value)) return res.status(400).json({ success: false, message: `Invalid ${paramName}` });
  return next();
};
