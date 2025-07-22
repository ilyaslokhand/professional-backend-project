
// we have created this asynchandler because we will call database again and again so we would not write try catch again and again so we created a common fuction

// 1st way

// const asyncHandler = (fn) => { 
//   return (req, res, next) => {
//     Promise.resolve(fn(req, res, next)).catch((error) => next(error));
//   };
// };


// 2nd way



const asyncHandler = (fn) => async (req, res, next) => {
  try {
    return await fn(req, res, next);  // ← yaha return likhna better practice hai
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};


export default asyncHandler
