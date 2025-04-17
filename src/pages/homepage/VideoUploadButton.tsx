import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { UploadIcon } from '@components/Icons';
import UploadVideoModal from '@components/UploadVideoModal';

const uploadSizeLimit: number = 1000; // MB

const VideoUploadButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [previewSource, setPreviewSource] = useState<{ src: string, type: string }>(null);
  const [videoFile, setVideoFile] = useState<File>();

  const closeModal = useCallback(() => setShowModal(false), []);
  const handleVideoUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];

    if (file) {
      const size = file.size / 1000000; // MB

      if (size > uploadSizeLimit) {
        return toast.error(`Sorry, file size should be less than ${uploadSizeLimit}MB`);
      }

      const url = URL.createObjectURL(file);

      setVideoFile(file);
      setPreviewSource({ src: url, type: file.type });
      setShowModal(true);

      // const data = await upload("video", file);
      //
      // setUrl(data);
      //
      // const ext = path.extname(data);
      //
      // setThumbnail(data.replace(ext, ".jpg"));
    }
  }, []);

  useEffect(() => {
    return () => {
      if (videoFile) {
        setVideoFile(null);
      }
    }
  }, [videoFile]);

  return (
    <div>
      <label htmlFor="video-upload">
        <UploadIcon />
      </label>
      <input
        style={{ display: "none" }}
        id="video-upload"
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
      />
      {showModal && (
        <UploadVideoModal
          videoFile={videoFile}
          source={previewSource}
          closeModal={closeModal}
        />
      )}
    </div>
  );
};

export default VideoUploadButton;
