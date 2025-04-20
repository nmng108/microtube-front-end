import { AxiosRequestConfig, HttpStatusCode } from 'axios';
import type { ApiResponse, ApisauceInstance } from 'apisauce';
import { createPathBuilder } from '@utilities';
import { redirect } from 'react-router';
import { ROUTES } from '@constants';

export abstract class AbstractHttpResource {
  private readonly _apisauceInstance: ApisauceInstance;
  private readonly _basePath: string;
  private readonly pathBuilder: (path?: string | number) => string;

  protected constructor(apisauceInstance: ApisauceInstance, basePath?: string) {
    this._apisauceInstance = apisauceInstance;
    this._basePath = basePath ?? '';
    this.pathBuilder = createPathBuilder(basePath);
  }

  get apisauceInstance(): ApisauceInstance {
    return this._apisauceInstance;
  }

  get basePath(): string {
    return this._basePath;
  }

  doGet<P, S, E = S>(path?: string | number, params?: P, axiosConfig?: AxiosRequestConfig, redirectsOn401: boolean = true): Promise<ApiResponse<S, E>> {
    return this._apisauceInstance.get<S, E>(this.pathBuilder(path), params, axiosConfig).then((res) => redirectsOn401 ? redirectOn401(res) : res);
  }

  doDelete<P, S, E = S>(path?: string | number, params?: P, axiosConfig?: AxiosRequestConfig, redirectsOn401: boolean = true): Promise<ApiResponse<S, E>> {
    return this._apisauceInstance.delete<S, E>(this.pathBuilder(path), params, axiosConfig).then((res) => redirectsOn401 ? redirectOn401(res) : res);
  }

  doPost<R, S, E = S>(path?: string | number, data?: R, axiosConfig?: AxiosRequestConfig, redirectsOn401: boolean = true): Promise<ApiResponse<S, E>> {
    return this._apisauceInstance.post<S, E>(this.pathBuilder(path), data, axiosConfig).then((res) => redirectsOn401 ? redirectOn401(res) : res);
  }

  doPut<R, S, E = S>(path?: string | number, data?: R, axiosConfig?: AxiosRequestConfig, redirectsOn401: boolean = true): Promise<ApiResponse<S, E>> {
    return this._apisauceInstance.put<S, E>(this.pathBuilder(path), data, axiosConfig).then((res) => redirectsOn401 ? redirectOn401(res) : res);
  }

  doPatch<R, S, E = S>(path?: string | number, data?: R, axiosConfig?: AxiosRequestConfig, redirectsOn401: boolean = true): Promise<ApiResponse<S, E>> {
    return this._apisauceInstance.patch<S, E>(this.pathBuilder(path), data, axiosConfig).then((res) => redirectsOn401 ? redirectOn401(res) : res);
  }
}

/**
 * Cover common API methods.
 */
export interface RestfulResourceInterface {
  getAll: <P, S, E = S>(params?: P, axiosConfig?: AxiosRequestConfig) => Promise<ApiResponse<S, E>>;
  get: <S, E = S>(id: string | number, axiosConfig?: AxiosRequestConfig) => Promise<ApiResponse<S, E>>;
  post: <R, S, E = S>(data?: R, axiosConfig?: AxiosRequestConfig) => Promise<ApiResponse<S, E>>;
  put: <R, S, E = S>(id: string | number, data?: R, axiosConfig?: AxiosRequestConfig) => Promise<ApiResponse<S, E>>;
  patch: <R, S, E = S>(id: string | number, data?: R, axiosConfig?: AxiosRequestConfig) => Promise<ApiResponse<S, E>>;
  delete: <S, E = S>(id: string | number, axiosConfig?: AxiosRequestConfig) => Promise<ApiResponse<S, E>>;
  bulkDelete: <P, S, E = S>(params?: P, axiosConfig?: AxiosRequestConfig) => Promise<ApiResponse<S, E>>;
}

export class RestfulResource extends AbstractHttpResource implements RestfulResourceInterface {
  constructor(apisauceInstance: ApisauceInstance, basePath?: string) {
    super(apisauceInstance, basePath);
  }

  getAll<P, S, E>(params?: P, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<S, E>> {
    return this.doGet<P, S, E>(null, params, axiosConfig);
  }

  get<S, E>(id: string | number, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<S, E>> {
    return this.doGet<null, S, E>(id, null, axiosConfig);
  }

  post<R, S, E>(data: R, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<S, E>> {
    return this.doPost<R, S, E>(null, data, axiosConfig);
  }

  put<R, S, E>(id: string | number, data: R, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<S, E>> {
    return this.doPut<R, S, E>(id, data, axiosConfig);
  }

  putForm<S, E, R = FormData>(path: string | number, data: R, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<S, E>> {
    const finalConfig: AxiosRequestConfig = {
      ...axiosConfig,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    return this.doPut<R, S, E>(path, data, finalConfig);
  }

  patch<R, S, E>(id: string | number, data: R, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<S, E>> {
    return this.doPatch<R, S, E>(id, data, axiosConfig);
  }

  delete<S, E>(id: string | number, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<S, E>> {
    return this.doDelete<null, S, E>(id, null, axiosConfig);
  }

  bulkDelete<P, S, E>(params: P, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<S, E>> {
    return this.doDelete<P, S, E>(null, params, axiosConfig);
  }
}

/**
 * An API call middleware which is in charge of auto-redirecting on 401 response.
 */
// Vite's build tool (esbuild) does not have plan for TS's decorator feature
function redirectOn401<S, E>(apiResponse: ApiResponse<S, E>) {
  if (!apiResponse.ok && apiResponse.status === HttpStatusCode.Unauthorized) {
    localStorage.removeItem('user');
    location.href = `${ROUTES.AUTH_LOGIN}?continue=${encodeURIComponent(location.pathname + location.search)}`;
  }

  return apiResponse;
}
