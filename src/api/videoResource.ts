import { restfulMainBackendWithBasePath } from './configs.ts';
import { CreateVideoDTO, SearchVideoDTO, UpdateVideoDTO, VideoDTO, VideoUpdateType } from '../models/video.ts';
import { BasePagingResponse, BaseResponse, ExceptionResponse } from '../models/base.ts';
import type { ApiResponse, ApisauceInstance } from 'apisauce';
import { RestfulResource } from '@api/base.ts';
import type { AxiosRequestConfig } from 'axios';

// const buildVideosEndpoint: (path?: string | number) => string = createPathBuilder('/videos');

class VideoResource {
  private readonly restfulResource: RestfulResource;

  constructor(apisauceInstance: ApisauceInstance) {
    this.restfulResource = new RestfulResource(apisauceInstance, 'videos');
  }

  getAll(params?: SearchVideoDTO, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BasePagingResponse<VideoDTO>, ExceptionResponse>> {
    return this.restfulResource.getAll<SearchVideoDTO, BasePagingResponse<VideoDTO>, ExceptionResponse>(params, axiosConfig);
  }

  get(id: string | number, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BaseResponse<VideoDTO>, ExceptionResponse>> {
    return this.restfulResource.get(id, axiosConfig);
  }

  create(body: CreateVideoDTO, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BaseResponse<VideoDTO>, ExceptionResponse>> {
    return this.restfulResource.post(body, axiosConfig);
  }

  update(id: string | number, body: UpdateVideoDTO, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BaseResponse<VideoDTO>, ExceptionResponse>> {
    return this.restfulResource.patch(id, body, axiosConfig);
  }

  uploadVideo(id: string | number, data: FormData, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BaseResponse, ExceptionResponse>> {
    return this.restfulResource.putForm(`${id}/upload`, data, axiosConfig);
  }

  uploadThumbnail(id: string | number, data: FormData, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BaseResponse, ExceptionResponse>> {
    return this.restfulResource.putForm(`${id}/thumbnail`, data, axiosConfig);
  }

  delete(id: string | number, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BaseResponse, ExceptionResponse>> {
    return this.restfulResource.delete(id, axiosConfig);
  }

  bulkDelete(id: Array<number | string>, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BaseResponse, ExceptionResponse>> {
    return this.restfulResource.bulkDelete({ id }, axiosConfig);
  }

  // updateViewerBehavior(id: string | number, body: UpdateVideoDTO, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BaseResponse<VideoDTO>, ExceptionResponse>> {
  //   if (body.updateType == VideoUpdateType.UPDATE_INFO) {
  //     throw new Error('Update info is forbidden');
  //   }
  //
  //   return this.restfulResource.doPatch(id, body, axiosConfig);
  // }
}

const videoResource = new VideoResource(restfulMainBackendWithBasePath);

export default videoResource;