import { toast } from 'react-toastify';
import { type AxiosRequestConfig } from 'axios';

export * from './localStorageMethods';

export function isNumber(n: unknown): boolean {
  return typeof n === 'number' && !Number.isNaN(Number(n));
}

export function isNotNumber(n: unknown): boolean {
  return !isNumber(n);
}

/**
 * `null` and `undefined` are taken into account and returns `true`.
 * @param str
 */
export function isEmpty(str: string | Array<unknown>): boolean {
  return !str || str.length == 0;
}

/**
 * `null` and `undefined` are taken into account and returns `false`.
 * @param str
 */
export function isNotEmpty(str: string | Array<unknown>): boolean {
  return !isEmpty(str);
}

/**
 * `null` and `undefined` are taken into account and returns `true`.
 * @param str
 */
export function isBlank(str: string): boolean {
  return !str || str.trim().length == 0;
}

/**
 * `null` and `undefined` are taken into account and returns `false`.
 * @param str
 */
export function isNotBlank(str: string): boolean {
  return !isBlank(str);
}

// Declare all characters
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// Generate random strings
export function generateRandomString(length: number = 5): string {
  let result = '';
  const charactersLength = characters.length;

  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export function createPathBuilder(basePath?: string): (path?: string | number) => string {
  if (basePath != undefined && (isBlank(basePath) || !/^\/?[\w-.]+(\/[\w-.]+)*$/.test(basePath))) {
    console.error(`Provided path "${basePath}" did not match required pattern: "^\\/?[\\w-.]+(\\/[\\w-.]+)*$"`);
    throw new Error(`Provided basePath "${basePath}" did not match required pattern: "^\\/?[\\w-.]+(\\/[\\w-.]+)*$"`);
  }

  const finalBasePath: string = (basePath && isNotBlank(basePath))
    ? '/' + basePath.replace(/^\/+/, '').replace(/\/+$/, '')
    : '';

  return (path?: string | number) => {
    if (path == undefined || (typeof path == 'string' && isBlank(path)) || (typeof path != 'string' && isNotNumber(path))) { // null, undefined, empty string
      return finalBasePath;
    }

    const pathStr: string = String(path);

    if (!/^\/?[\w-.]+(\/[\w-.]+)*$/.test(pathStr)) {
      console.error(`Provided path "${pathStr}" did not match required pattern: "^\\/?[\\w-.]+(\\/[\\w-.]+)*$"`);
      throw new Error(`Provided path "${pathStr}" did not match required pattern: "^\\/?[\\w-.]+(\\/[\\w-.]+)*$"`);
    }

    return `${finalBasePath}/${pathStr.replace(/^\/+/, '')}`;
  };
}

// export async function executeSimpleApisauceCall<S, E>(apiCall: () => Promise<ApiResponse<S, E>>): Promise<ApiResponse<S, E>> {
//   console.log(apiCall);
//   console.log(await apiCall());
//   // this function can't be run if being written as follows (reason: this.restfulResource is undefined???):
//   // createAsyncThunk('', async () => executeSimpleApisauceCall(userResource.getDetails))
//   // Instead, it must be written like the following:
//   // createAsyncThunk('', async () => executeSimpleApisauceCall(() => userResource.getDetails()))
//   const apiResponse = await apiCall();
//
//   // console.error(`Error emitted for API call '${apiResponse.config.method} ${apiResponse.config.url}. Reason: ${apiResponse.problem} - ${apiResponse.status}`);
//
//   return apiResponse;
// }

export async function uploadImmediate<T extends Promise<unknown>>(file: File, uploadFunction: (formData: FormData, config: AxiosRequestConfig) => T): Promise<T> {
  const formData = new FormData();

  formData.append('file', file);
  console.log(file);
  let toastId = null;
  const config: AxiosRequestConfig = {
    onUploadProgress: (p) => {
      const progress = p.loaded / p.total;

      if (toastId === null) {
        toastId = toast('Upload in Progress', { progress });
      } else {
        toast.update(toastId, { progress });
      }
    },
  };

  const res = await uploadFunction(formData, config);

  toast.dismiss(toastId);

  return res;
}
