
export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(message: string, status: number = 0, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static fromStatus(status: number, serverMessage?: string): ApiError {
    const defaults: Record<number, string> = {
      400: "Invalid request. Please check your inputs.",
      401: "You are not authenticated. Please log in again.",
      403: "You don't have permission to perform this action.",
      404: "The requested resource was not found.",
      409: "A conflict occurred. This resource may already exist.",
      500: "Internal server error. Please try again later.",
    };
    const message = serverMessage || defaults[status] || "Something went wrong.";
    return new ApiError(message, status);
  }

  /** Parse a fetch Response and throw an ApiError if not successful */
  static async handle(res: Response): Promise<unknown> {
    let data: any;
    try {
      data = await res.json();
    } catch {
      if (!res.ok) throw ApiError.fromStatus(res.status);
      throw new ApiError("Invalid response format from server.", res.status);
    }

    if (!res.ok || !data.success) {
      const err = ApiError.fromStatus(res.status, data.message);

      if (data.errors && Array.isArray(data.errors)) {
        for (const e of data.errors) {
          err.fieldErrors[e.field] = e.message;
        }
      }

      throw err;
    }

    return data;
  }
}
