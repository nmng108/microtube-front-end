import { ChannelDTO, type ChannelStateData, toChannelStateData } from '@models/channel.ts';

export interface UserState {
  data: UserStateData;
  channels: Array<ChannelStateData>;
  problemMessage?: string;
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
