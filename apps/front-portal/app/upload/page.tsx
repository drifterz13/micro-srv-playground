"use client";

import React, { useState, useRef, useEffect } from "react";

interface UploadStatus {
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

interface ContentCreationResult {
  id: string;
  key: string;
  contentType: string;
}

type ContentType = "image" | "video" | "file";

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [createdContent, setCreatedContent] = useState<ContentCreationResult | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    uploading: false,
    progress: 0,
    error: null,
    success: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImageFile = (file: File): boolean => {
    return file.type.startsWith("image/");
  };

  const isVideoFile = (file: File): boolean => {
    return file.type.startsWith("video/");
  };

  const isPdfFile = (file: File): boolean => {
    return file.type === "application/pdf";
  };

  const detectContentType = (file: File): ContentType => {
    if (isImageFile(file)) return "image";
    if (isVideoFile(file)) return "video";
    if (isPdfFile(file)) return "file"; // PDF maps to "file" type
    return "file"; // Default to "file" for other types
  };

  const createPreviewUrl = (file: File) => {
    if (isImageFile(file)) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return url;
    }
    setPreviewUrl(null);
    return null;
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      createPreviewUrl(file);
      setContentType(detectContentType(file));
      setCreatedContent(null);
      setUploadStatus({
        uploading: false,
        progress: 0,
        error: null,
        success: false,
      });
    }
  };

  const getPresignedUrl = async (): Promise<string> => {
    const response = await fetch(
      "http://localhost:4000/upload/presigned",
    );
    if (!response.ok) {
      throw new Error("Failed to get presigned URL");
    }
    return response.text();
  };

  const extractFileKeyFromUrl = (presignedUrl: string): string => {
    try {
      const url = new URL(presignedUrl);
      const pathSegments = url.pathname.split('/');
      // The file key (UUID) should be the last segment of the path
      const fileKey = pathSegments[pathSegments.length - 1];

      if (!fileKey) {
        throw new Error("Could not extract file key from presigned URL");
      }

      return fileKey;
    } catch (error) {
      throw new Error("Invalid presigned URL format");
    }
  };

  const createContent = async (key: string, contentType: ContentType): Promise<ContentCreationResult> => {
    const response = await fetch("http://localhost:4000/contents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
        contentType,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create content record");
    }

    return response.json();
  };

  const uploadToMinio = async (
    file: File,
    presignedUrl: string,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadStatus((prev) => ({ ...prev, progress }));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed due to network error"));
      });

      xhr.open("PUT", presignedUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !contentType) return;

    setUploadStatus({
      uploading: true,
      progress: 0,
      error: null,
      success: false,
    });

    try {
      // Step 1: Get presigned URL
      const presignedUrl = await getPresignedUrl();

      // Step 2: Upload file to Minio
      await uploadToMinio(selectedFile, presignedUrl);

      // Step 3: Extract file key and create content record
      const fileKey = extractFileKeyFromUrl(presignedUrl);
      const createdContentResult = await createContent(fileKey, contentType);

      // Step 4: Update state with success
      setCreatedContent(createdContentResult);
      setUploadStatus({
        uploading: false,
        progress: 100,
        error: null,
        success: true,
      });
    } catch (error) {
      setUploadStatus({
        uploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : "Upload failed",
        success: false,
      });
    }
  };

  const resetUpload = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setContentType(null);
    setCreatedContent(null);
    setUploadStatus({
      uploading: false,
      progress: 0,
      error: null,
      success: false,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload File</h1>
          <p className="text-gray-600">Select a file to upload to storage</p>
        </div>

        {!selectedFile ? (
          <div className="relative border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors border-gray-300">
            <input
              ref={fileInputRef}
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileSelect}
            />
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-gray-600">
                <p className="text-sm">
                  <span className="font-medium text-blue-600 hover:text-blue-500">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500">Any file type</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {previewUrl && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mx-auto max-h-48 max-w-full rounded-lg shadow-sm"
                  />
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0">
                      {isImageFile(selectedFile) ? (
                        <svg
                          className="h-5 w-5 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(selectedFile.size)} •{" "}
                        {selectedFile.type || "Unknown type"}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={resetUpload}
                  className="ml-3 text-gray-400 hover:text-gray-600"
                  disabled={uploadStatus.uploading}
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content Type Selection */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Content Type</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <input
                    id="content-type-image"
                    name="content-type"
                    type="radio"
                    value="image"
                    checked={contentType === "image"}
                    onChange={(e) => setContentType(e.target.value as ContentType)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    disabled={uploadStatus.uploading}
                  />
                  <label htmlFor="content-type-image" className="text-sm text-gray-700">
                    📸 Image
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    id="content-type-video"
                    name="content-type"
                    type="radio"
                    value="video"
                    checked={contentType === "video"}
                    onChange={(e) => setContentType(e.target.value as ContentType)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    disabled={uploadStatus.uploading}
                  />
                  <label htmlFor="content-type-video" className="text-sm text-gray-700">
                    🎥 Video
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    id="content-type-file"
                    name="content-type"
                    type="radio"
                    value="file"
                    checked={contentType === "file"}
                    onChange={(e) => setContentType(e.target.value as ContentType)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    disabled={uploadStatus.uploading}
                  />
                  <label htmlFor="content-type-file" className="text-sm text-gray-700">
                    📄 File/Document
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Auto-detected: <strong>{contentType}</strong> (you can override)
              </p>
            </div>

            {uploadStatus.uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Uploading...</span>
                  <span>{uploadStatus.progress}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadStatus.progress}%` }}
                  />
                </div>
              </div>
            )}

            {uploadStatus.error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="ml-2 text-sm text-red-700">
                    {uploadStatus.error}
                  </p>
                </div>
              </div>
            )}

            {uploadStatus.success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-400 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-green-800">
                      Content uploaded and created successfully!
                    </p>
                    {createdContent && (
                      <div className="mt-2 text-sm text-green-700">
                        <p><strong>Content ID:</strong> {createdContent.id}</p>
                        <p><strong>File Key:</strong> {createdContent.key}</p>
                        <p><strong>Type:</strong> {createdContent.contentType}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleUpload}
                disabled={uploadStatus.uploading || uploadStatus.success || !contentType}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadStatus.uploading ? "Uploading..." : "Upload & Create Content"}
              </button>
              {uploadStatus.success && (
                <button
                  onClick={resetUpload}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Upload Another
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
