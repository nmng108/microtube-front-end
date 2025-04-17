import { HttpStatusCode } from 'axios';

class HttpException extends Error {
  private readonly _code: number;

  constructor(httpStatusCode: HttpStatusCode, message: string) {
    super(message);
    this._code = httpStatusCode;
  }

  get code(): number {
    return this._code;
  }
}

export default HttpException;