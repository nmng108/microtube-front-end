import { restfulMainBackendWithBasePath } from './configs.ts';
import { SearchVideoDTO, VideoDTO } from '../models/video.ts';
import { BasePagingResponse, BaseResponse, ExceptionResponse } from '../models/base.ts';
import type { ApiResponse, ApisauceInstance } from 'apisauce';
import { RestfulResource } from '@api/base.ts';
import type { AxiosRequestConfig } from 'axios';
import { ChannelDTO } from '@models/channel.ts';

class ChannelResource {
  private readonly restfulResource: RestfulResource;

  constructor(apisauceInstance: ApisauceInstance) {
    this.restfulResource = new RestfulResource(apisauceInstance, 'channels');
  }

  getAll(params?: SearchVideoDTO, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BasePagingResponse<ChannelDTO>, ExceptionResponse>> {
    return this.restfulResource.getAll<SearchVideoDTO, BasePagingResponse<ChannelDTO>, ExceptionResponse>(params, axiosConfig);
  }

  get(id: string | number, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BaseResponse<ChannelDTO>, ExceptionResponse>> {
    return this.restfulResource.get(id, axiosConfig);
  }

  create(body, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BaseResponse<ChannelDTO>, ExceptionResponse>> {
    return this.restfulResource.post(body, axiosConfig);
  }

  update(id: string | number, body, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BaseResponse<ChannelDTO>, ExceptionResponse>> {
    return this.restfulResource.patch(id, body, axiosConfig);
  }

  uploadAvatar(id: string | number, data: FormData, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BaseResponse<string>, ExceptionResponse>> {
    if (!data.has('file')) {
      throw new Error('FormData must contain "file"');
    } else if (!(data.get('file') instanceof File)) {
      throw new Error('Input "file" must be of File');
    }

    return this.restfulResource.putForm(`${id}/avatar`, data, axiosConfig);
  }

  delete(id: string | number, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BaseResponse, ExceptionResponse>> {
    return this.restfulResource.delete(id, axiosConfig);
  }

  changeSubscriptionState(id: string | number, subscribes: boolean, axiosConfig?: AxiosRequestConfig): Promise<ApiResponse<BaseResponse<VideoDTO>, ExceptionResponse>> {
    return this.restfulResource.doPatch(`${id}/${subscribes ? 'subscribe' : 'unsubscribe'}`, null, axiosConfig);
  }
}

const channelResource = new ChannelResource(restfulMainBackendWithBasePath);

export default channelResource;