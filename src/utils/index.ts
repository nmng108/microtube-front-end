import axios from 'axios';
import { toast } from 'react-toastify';


interface HttpConfigs {
  body?: object,
  token?: string,
  headers?: {
    authorization: string,
  }
}

export const client = async (endpoint: string, { body, ...customConfig }: HttpConfigs = {}) => {
  const user = JSON.parse(localStorage.getItem('user'));

  const config: RequestInit = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  // if (customConfig.token) {
  //   config.headers['authorization'] = `Bearer ${customConfig.token}`;
  // } else if (user?.token) {
  //   config.headers['authorization'] = `Bearer ${user.token}`;
  // }

  const res = await fetch(endpoint, config);
  const data = await res.json();

  if (res.status !== 200) {
    return toast(data.message);
  }

  return data;
};

export const timeSince = (timestamp: number): string => {
  const seconds = Math.floor((Number(new Date()) - Number(new Date(timestamp))) / 1000);
  let interval = Math.floor(seconds / 31536000);

  if (interval > 1) {
    return interval + ' years';
  }

  interval = Math.floor(seconds / 2592000);

  if (interval > 1) {
    return interval + ' months';
  }

  interval = Math.floor(seconds / 86400);

  if (interval > 1) {
    return interval + ' days';
  }

  interval = Math.floor(seconds / 3600);

  if (interval > 1) {
    return interval + ' hours';
  }

  interval = Math.floor(seconds / 60);

  if (interval > 1) {
    return interval + ' minutes';
  }

  return Math.floor(seconds) + ' seconds';
};

export const upload = async (resourceType, file) => {
  const formData = new FormData();

  formData.append('file', file);

  let toastId = null;
  const config = {
    onUploadProgress: (p) => {
      const progress = p.loaded / p.total;
      if (toastId === null) {
        toastId = toast('Upload in Progress', {
          progress,
        });
      } else {
        toast.update(toastId, {
          progress,
        });
      }
    },
  };

  const { data } = await axios.post(
    `${process.env.REACT_APP_CLOUDINARY_ENDPOINT}/${resourceType}/upload`,
    formData,
    config,
  );

  toast.dismiss(toastId);

  return data.secure_url;
};

export const removeChannelLocalSt = (channelId: number | string) => {
  const user = JSON.parse(localStorage.getItem('user'));

  const updated = {
    ...user,
    channels: user.channels.filter((channel) => channel.id !== channelId),
  };

  localStorage.setItem('user', JSON.stringify(updated));
};

export const addChannelLocalSt = (channel) => {
  const user = JSON.parse(localStorage.getItem('user'));

  const updated = {
    ...user,
    channels: [channel, ...user.channels],
  };

  localStorage.setItem('user', JSON.stringify(updated));
};

export const updateUserLocalSt = (data) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const updatedUser = { ...user, ...data };
  localStorage.setItem('user', JSON.stringify(updatedUser));
};



export const rem = (px: number | `${number}px`): `${number}rem` => {
  switch (typeof px) {
    case "string":
      return `${Number(px.split("px")[0]) / 16}rem`;
    case "number":
      return `${px / 16}rem`;
    default:
      throw new Error("Invalid px type");
  }
};

export const secToTimeString = (secondsValue: number) => {
  const withLeadZero = (strInt: number) => String(strInt).padStart(2, "0");

  const hours = Math.floor(secondsValue / 3600);
  const minutes = Math.floor(secondsValue / 60);
  const seconds = Math.floor(secondsValue % 60);

  const hourStr = withLeadZero(hours);
  const minStr = withLeadZero(minutes);
  const secStr = withLeadZero(seconds);

  return `${hourStr === "00" ? "" : `${hourStr}:`}${minStr}:${secStr}`;
};

export const isValidUrl = (str: string) => {
  const pattern = new RegExp(
    "^(https:?//)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
    "(\\#[-a-z\\d_]*)?$", // fragment locator
    "i",
  );
  if (!pattern.test(str)) {
    throw new Error("Invalid URL");
  }
};
