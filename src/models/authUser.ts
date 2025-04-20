import { ChannelDTO, type ChannelStateData, toChannelStateData } from '@models/channel.ts';

export interface UserState {
  status: UserStateStatus;
  data: UserStateData;
  channels: Array<ChannelStateData>;
  problemMessage?: string;
}

export enum UserStateStatus {
  NONE,
  IS_LOGGING_IN,
  LOGIN_FAILED,
  LOGIN_SUCCEEDED,

  IS_SIGNING_UP,
  SIGNUP_FAILED,
  SIGNUP_SUCCEEDED,

  IS_FETCHING,
  FETCHING_FAILED,
  FETCHING_SUCCEEDED,

  IS_UPDATING_USER,
  USER_UPDATED,
  USER_NOT_UPDATED,

  IS_CREATING_CHANNEL,
  CHANNEL_CREATED,
  CHANNEL_NOT_CREATED,

  // IS_UPDATING_CHANNEL,
  // CHANNEL_UPDATED,
  // CHANNEL_NOT_UPDATED,

  IS_DELETING_CHANNEL,
  CHANNEL_DELETED,
  CHANNEL_NOT_DELETED,
}

export interface UserStateData {
  id: number;
  username: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  avatar?: string;
  // token?: string;
  ownedChannel?: ChannelStateData;
  subscribedChannels?: Array<ChannelStateData>;
}

export interface LoginRequestBody {
  username: string;
  password: string;
}

export interface LoginResponseBody {
  username: string;
  token: string;
  expireAt: string;
}

export interface SignupRequestBody {
  username: string;
  password: string;
  name: string;
  email?: string;
  phoneNumber?: string;
}

export interface UpdateUserDTO {
  username?: string;
  password?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
}

export interface UserDTO {
  id: number;
  username: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  avatar?: string;
  cover?: string;
  createdAt: string;
  channel?: ChannelDTO;
}

export function toUserStateData(userDTO: UserDTO): UserStateData {
  return {
    id: userDTO.id,
    username: userDTO.username,
    name: userDTO.name,
    email: userDTO.email,
    phoneNumber: userDTO.phoneNumber,
    avatar: userDTO.avatar,
    ownedChannel: userDTO.channel ? toChannelStateData(userDTO.channel) : null,
  }
}
