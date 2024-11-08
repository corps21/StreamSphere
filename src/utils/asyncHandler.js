// The purpose is to add the try and catch block and and we are calling a database operation,it will take an async function and wrap if inside the try and catch block for error handling and return the result of the async function

const asyncHandler = (asyncFunction) => {
    // as we are using express to create the server it provides with req and res, we are creating a promise with resolve value as the async function this is for consistency because in case the asyncfunction is not a async error can still be handled by the catch block
    return (req,res,next) => {
        Promise.resolve(asyncFunction(req,res,next))
        .catch(error => next(error))
    }
}

export default asyncHandler