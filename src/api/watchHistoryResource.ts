import { restfulMainBackendWithBasePath } from './configs.ts';
import type { BasePagingResponse, BaseResponse, ExceptionResponse, PagingRequest } from '../models/base.ts';
import type { ApiResponse, ApisauceInstance } from 'apisauce';
import { RestfulResource } from '@api/base.ts';
import type { AxiosRequestConfig } from 'axios';
import type { CommentDTO, CreateCommentDTO, UpdateCommentDTO } from '@models/comment.ts';
import { AppendHistoryRecordDTO, WatchHistoryDTO } from '@models/watchHistory.ts';

class WatchHistoryResource {
  private readonly restfulResource: RestfulResource;

  constructor(apisauceInstance: ApisauceInstance) {
    this.restfulResource = new RestfulResource(apisauceInstance, '/watch-history');
  }

  getAll(params?: PagingRequest, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BasePagingResponse<WatchHistoryDTO>, ExceptionResponse>> {
    return this.restfulResource.doGet<PagingRequest, BasePagingResponse<WatchHistoryDTO>, ExceptionResponse>('', params, axiosConfig);
  }

  get(id: number, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BaseResponse<WatchHistoryDTO>, ExceptionResponse>> {
    return this.restfulResource.doGet(id, null, axiosConfig);
  }

  log(body: AppendHistoryRecordDTO, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BaseResponse<WatchHistoryDTO>, ExceptionResponse>> {
    return this.restfulResource.doPut('', body, axiosConfig, false);
  }

  delete(ids: number[], axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BaseResponse, ExceptionResponse>> {
    return this.restfulResource.doDelete('', { id: ids }, axiosConfig);
  }
}

const watchHistoryResource = new WatchHistoryResource(restfulMainBackendWithBasePath);

export default watchHistoryResource;