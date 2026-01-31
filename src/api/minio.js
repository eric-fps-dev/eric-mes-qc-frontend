// src/api/minio.js

import { ENV_CONFIG } from '@/utils/env'

const MINIO_URL = ENV_CONFIG.MINIO_URL
const DEFAULT_BUCKET_NAME = ENV_CONFIG.DEFAULT_BUCKET_NAME

/**
 * Uploads a single file to MinIO via multipart/form-data.
 * @param {File} file - The file to upload.
 * @returns {Promise} - Resolves with the response from the server.
 */
export async function uploadToMinio(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bucketName', DEFAULT_BUCKET_NAME)

  const response = await fetch(`${MINIO_URL}/files/upload-multipart`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error('File upload failed')
  }

  return await response.json()
}

/**
 * Uploads multiple files to MinIO using /files/upload-multipart-list.
 * @param {File[]} files - An array of File objects.
 * @returns {Promise} - Resolves with the response from the server.
 */
export async function uploadMultipleToMinio(files) {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })

  const response = await fetch(`${MINIO_URL}/files/upload-multipart-list?bucketName=${DEFAULT_BUCKET_NAME}`, {
    method: 'POST',
    body: formData
  })

  return await response.json()
}

/**
 * Delete list of objects from MinIO.
 * @param {Object} objectInfo - The data object with bucket name and object url list.
 * @param {string} objectInfo.bucketName - The bucket name.
 * @param {string[]} objectInfo.objectUrls - Array of object URLs to delete.
 * @returns {Promise} - API response.
 */
export async function deleteObjectList(objectInfo) {
  const response = await fetch(`${MINIO_URL}/files/object-list`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(objectInfo)
  })
  return await response.json()
}

/**
 * Get the MinIO URL for constructing absolute paths
 * @returns {string} - The MinIO base URL
 */
export function getMinioBaseUrl() {
  return MINIO_URL
}

/**
 * Get the default bucket name
 * @returns {string} - The default bucket name
 */
export function getDefaultBucketName() {
  return DEFAULT_BUCKET_NAME
}
