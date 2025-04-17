import { restfulMainBackendWithBasePath } from './configs.ts';
import type { BasePagingResponse, BaseResponse, ExceptionResponse, PagingRequest } from '../models/base.ts';
import type { ApiResponse, ApisauceInstance } from 'apisauce';
import { RestfulResource } from '@api/base.ts';
import type { AxiosRequestConfig } from 'axios';
import type { CommentDTO, CreateCommentDTO, UpdateCommentDTO } from '@models/comment.ts';

class CommentResource {
  private readonly restfulResource: RestfulResource;

  constructor(apisauceInstance: ApisauceInstance) {
    this.restfulResource = new RestfulResource(apisauceInstance);
  }

  getAll(videoId: string | number, params?: PagingRequest & {
    parentId?: number
  }, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BasePagingResponse<CommentDTO>, ExceptionResponse>> {
    return this.restfulResource.doGet<PagingRequest, BasePagingResponse<CommentDTO>, ExceptionResponse>(`/videos/${videoId}/comments`, params, axiosConfig);
  }

  get(id: string | number, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BaseResponse<CommentDTO>, ExceptionResponse>> {
    return this.restfulResource.doGet(`/comments/${id}`, axiosConfig);
  }

  create(body: CreateCommentDTO, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BaseResponse<CommentDTO>, ExceptionResponse>> {
    return this.restfulResource.doPost('/comments', body, axiosConfig);
  }

  update(id: string | number, body: UpdateCommentDTO, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BaseResponse<CommentDTO>, ExceptionResponse>> {
    return this.restfulResource.doPatch(`/comments/${id}`, body, axiosConfig);
  }

  delete(id: string | number, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BaseResponse, ExceptionResponse>> {
    return this.restfulResource.doDelete(`/comments/${id}`, axiosConfig);
  }
}

const commentResource = new CommentResource(restfulMainBackendWithBasePath);

export default commentResource;