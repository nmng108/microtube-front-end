export interface BaseResponse<T = null> {
  /**
   * Should equal 0 for successful response.
   */
  status: 0;
  message: string;
  data: T;
}

export interface ExceptionResponse {
  /**
   * Should equal a value other than 0 for error response.
   */
  status: -1;
  message: string;
  errorCode: string;
  /**
   * The list of error details.<br>
   * - If the HTTP status is 4xx (client error), this list may be used to show to end user's UI or not (depend on specific API).<br>
   * - If the HTTP status is 5xx (server error), this list should be used only to inform API users what's being wrong with the server.
   * <br>
   * There is only 1 format: {@linkcode Array<string>}. Element inside the list can be either a string or a POJO.
   */
  details: Array<string | InvalidInputField>;
  /**
   * Provide identity and traceability to an exception response.
   */
  requestId: string;
  timestamp: string; // UTC timestamp
}

interface InvalidInputField {
  field: string;
  message: string;
}

export interface PagingRequest {
  page?: number;
  size?: number;
  unpaged?: boolean;
}

export interface PagingResponse<T> {
  current: number;
  size: number;
  totalPages: number;
  totalRecords: number;
  dataset: T[];
}

export type BasePagingResponse<T> = BaseResponse<PagingResponse<T>>