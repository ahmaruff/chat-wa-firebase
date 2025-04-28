const responseFormatter = (status, code, message, data = null) => {
    return {
      status: status,  // 'success', 'fail', 'error'
      code: code,      // HTTP status code
      message: message,  // Response message
      data: data,       // Data or null
    };
  };
  
  module.exports = responseFormatter;
  