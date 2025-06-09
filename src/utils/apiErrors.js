class apiError extends Error{
 constructor(
  statusCode,
  message = 'Internal Server Error',
  errors=[],
  stack = ""
 ){
  super(message);
  this.statusCode = statusCode;
  this.errors = errors
  this.data = null,
  this.stack = stack,
  this.success = false,
  this.message = message
  if(stack){
  this.stack = stack
  }else{
    Error.captureStackTrace(this, this.constructor);
  }
}
}

export default apiError;