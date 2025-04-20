import { ApiResponse, ApisauceInstance } from 'apisauce';
import { restfulMainBackendWithBasePath } from './configs.ts';
import { type BaseResponse, type ExceptionResponse, PagingRequest, PagingResponse } from '../models/base';
import type {
  LoginRequestBody,
  LoginResponseBody,
  SignupRequestBody,
  UpdateUserDTO,
  UserDTO,
} from '../models/authUser.ts';
import { RestfulResource } from '@api/base.ts';

class AuthResource {
  private readonly restfulResource: RestfulResource;

  constructor(apisauceInstance: ApisauceInstance) {
    this.restfulResource = new RestfulResource(apisauceInstance, 'auth');
  }

  login(body: LoginRequestBody): Promise<ApiResponse<BaseResponse<LoginResponseBody>, ExceptionResponse>> {
    return this.restfulResource.doPost<LoginRequestBody, BaseResponse<LoginResponseBody>, ExceptionResponse>('/login', body, null, false);
  }

  logout(): Promise<ApiResponse<void, ExceptionResponse>> {
    return this.restfulResource.doGet<void, void, ExceptionResponse>('/logout');
  }

  signup(body: SignupRequestBody): Promise<ApiResponse<BaseResponse<LoginResponseBody>, ExceptionResponse>> {
    return this.restfulResource.doPost<SignupRequestBody, BaseResponse, ExceptionResponse>('/signup', body);
  }
}

class UserResource {
  private readonly restfulResource: RestfulResource;

  constructor(apisauceInstance: ApisauceInstance) {
    this.restfulResource = new RestfulResource(apisauceInstance, 'users');
  }

  getAll(params: PagingRequest): Promise<ApiResponse<BaseResponse<PagingResponse<UserDTO>>, ExceptionResponse>> {
    // const bearerToken: string = token ?? localStorage.getItem('token');

    return this.restfulResource.getAll<PagingRequest, BaseResponse<PagingResponse<UserDTO>>, ExceptionResponse>(params, {
      // headers: { authorization: token },
    });
  }

  /**
   * Requires token to fetch current user's details.
   */
  getDetails(token?: string): Promise<ApiResponse<BaseResponse<UserDTO>, ExceptionResponse>> {
    // const bearerToken: string = token ?? localStorage.getItem('token');
    // console.log('found base class: ', this.restfulResource);
    // return this.restfulResource.get<BaseResponse<UserDTO>, ExceptionResponse>('details', {
    //   // headers: { authorization: token },
    // });
    return this.restfulResource.doGet<null, BaseResponse<UserDTO>, ExceptionResponse>('details', null, {
      // headers: { authorization: token },
    });
  }

  selfUpdate(body: UpdateUserDTO): Promise<ApiResponse<BaseResponse<UserDTO>, ExceptionResponse>> {
    return this.restfulResource.doPatch<UpdateUserDTO, BaseResponse<UserDTO>, ExceptionResponse>('details', body);
  }
}

const authResource = new AuthResource(restfulMainBackendWithBasePath);
const userResource = new UserResource(restfulMainBackendWithBasePath);

export { authResource, userResource };