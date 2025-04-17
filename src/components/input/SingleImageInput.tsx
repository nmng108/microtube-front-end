import React, { useCallback, useEffect, useRef, useState } from 'react';
import { File, UploadCloud, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { generateRandomString } from '@utilities';

interface FileWithPreview extends File {
  preview?: string;
}

type Props = {
  onChange?: (file: File) => void;
  className?: string;
};

const SingleImageInput: React.FC<Props> = ({ onChange, className }) => {
  const inputName = useRef<string>(generateRandomString(5));
  const [file, setFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback((newFile: File) => {
    setFile(newFile);

    if (newFile?.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(newFile));
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;

    handleFileChange(droppedFiles[0]);
  }, [handleFileChange]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;

    if (selectedFiles.length > 0) {
      handleFileChange(selectedFiles[0]);
    }
  }, [handleFileChange]);

  const removeFile = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl); // Clean up object URLs
    }

    setFile(null);
  }, [previewUrl]);

  // Clean up object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [file]);

  useEffect(() => {
    if (onChange && typeof onChange == 'function') {
      onChange(file);

      return () => {
        onChange(null);
      };
    }
  }, [file, onChange]);

  return (
    <div className={`${className}`}>
      <AnimatePresence>
        {!file ? (
          <>
            <label
              htmlFor={inputName.current}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={
                `block w-full h-full border-2 border-dashed rounded-lg p-2 text-center cursor-pointer transition-colors bg-gray-900/50
                  ${isDragging
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'}`
              }
            >
              <UploadCloud className="w-10 h-10 mx-auto text-gray-400 mb-1" />
              <p className="text-gray-300 text-sm">Drag &apos;n&apos; drop files, or click to select files</p>
            </label>
            <input
              name={inputName.current}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              // className=" inset-0 opacity-0 cursor-pointer"
              // title="" // Improves accessibility
              // aria-label="Upload files"
              hidden
            />
          </>
        ) : (
          <div className="space-y-4">
            {/*<div className="space-y-2">*/}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="relative p-2 rounded-md bg-gray-800 border border-gray-700"
            >
              <div className="flex items-center gap-2 truncate">
                {/*{file?.type?.startsWith('image/') ? (*/}
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Thumbnail"
                    className="h-full rounded-md object-cover"
                  />
                </div>
                {/*) : (*/}
                {/*// <File className="w-6 h-6 text-gray-400" />*/}
                {/*)}*/}
                {/*<span className="text-gray-300 truncate">{file?.name}</span>*/}
              </div>
              <span
                // variant="contained"
                // size="icon"
                onClick={() => removeFile()}
                className="absolute top-0 right-0 -mt-1 -mr-1 text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </span>
            </motion.div>
            {/*</div>*/}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SingleImageInput;
