export const success = (res, data, status = 200, pagination = null) => {
  const body = { success: true, data };
  if (pagination) body.pagination = pagination;
  return res.status(status).json(body);
};

export const error = (res, message, status = 500) => res.status(status).json({ success: false, message });
