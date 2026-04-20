/**
 * Shared API error handler.
 * Parses the response and returns a human-readable message
 * based on status code — consistent across all pages.
 */
export class ApiError {
  message: string;
  status: number;
  fieldErrors: Record<string, string>;

  constructor(message: string, status: number = 0, fieldErrors: Record<string, string> = {}) {
    this.message = message;
    this.status = status;
    this.fieldErrors = fieldErrors;
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
    const data = await res.json();

    if (!res.ok || !data.success) {
      const err = ApiError.fromStatus(res.status, data.message);

      // Attach field-level errors if present (400 validation)
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
