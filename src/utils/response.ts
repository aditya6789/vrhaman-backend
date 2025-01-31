interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T | null;
  status: number;
}

interface FailureResponse {
  success: false;
  message: string;
  data: {
    [key: string]: any;
  } | null;
  status: number;
}



function successResponse<T>(
  message: string,
  data: T | null = null,
  status: number = 200
): SuccessResponse<T> {
  return {
    success: true,
    message: message,
    data: data,
    status: status,
  };
}

function failureResponse(
  message: string,
  data: {
    [key: string]: any;
  } | null = null,
  status: number = 400
): FailureResponse {
  return {
    success: false,
    message: message,
    data: data,
    status: status,
  };
}

export { successResponse, failureResponse, SuccessResponse, FailureResponse };
