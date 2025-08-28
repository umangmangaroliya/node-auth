const ValidationError = (errors) => {
  return errors.map((error) => ({
    field: error.path[0],
    message: error.message,
  }));
};

export default ValidationError;
