const CLOUDINARY_CLOUD_NAME = 'diipwifar'
const CLOUDINARY_UPLOAD_PRESET = 'storage_tictoc'

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`

export const uploadVideoToCloudinary = async (videoUri, onProgress) => {
  const formData = new FormData()

  // ✅ Extension dynamique
  const extension = videoUri.split('.').pop() || 'mp4'
  const mimeType = extension === 'mov' ? 'video/quicktime' : 'video/mp4'

  formData.append('file', {
    uri: videoUri,
    type: mimeType,
    name: `video_${Date.now()}.${extension}`,
  })
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  // ✅ resource_type retiré du formData (déjà dans l'URL)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100)
        onProgress(progress)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText)
        resolve({
          url: response.secure_url,
          publicId: response.public_id,
          duration: response.duration || 0,
          thumbnail: getVideoThumbnail(response.secure_url),
        })
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'))
    })

    xhr.open('POST', CLOUDINARY_UPLOAD_URL)
    xhr.send(formData)
  })
}

export const getVideoThumbnail = (videoUrl, options = {}) => {
  const { width = 400, height = 600 } = options
  return videoUrl
    .replace('/video/upload/', `/video/upload/w_${width},h_${height},c_fill,so_0/`)
    .replace(/\.\w+$/, '.jpg')
}