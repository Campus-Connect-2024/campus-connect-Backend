import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  try {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Health Checkup Successfull"));
  } catch (error) {
    throw new ApiError(503, error);
  }
});

export { healthcheck };
