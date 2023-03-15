const error = (e) => {
  return {
    msg: e.message || e.msg,
    status: 'FAILED'
  };
};

export default error;
