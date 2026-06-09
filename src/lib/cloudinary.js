// Cloudinary configuration
// Replace these values with your actual Cloudinary credentials
const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUD_NAME'
const CLOUDINARY_UPLOAD_PRESET = 'YOUR_UPLOAD_PRESET'

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`

/**
 * Upload a video to Cloudinary using unsigned upload
 * @param {string} videoUri - Local file URI of the video
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<{url: string, publicId: string, duration: number}>}
 */
export const uploadVideoToCloudinary = async (videoUri, onProgress) => {
  const formData = new FormData()

  formData.append('file', {
    uri: videoUri,
    type: 'video/mp4',
    name: `video_${Date.now()}.mp4`,
  })
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('resource_type', 'video')

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
          thumbnail: response.secure_url.replace(/\.\w+$/, '.jpg'),
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

/**
 * Get a Cloudinary video thumbnail URL
 * @param {string} videoUrl - Cloudinary video URL
 * @param {object} options - Thumbnail options
 * @returns {string} - Thumbnail URL
 */
export const getVideoThumbnail = (videoUrl, options = {}) => {
  const { width = 400, height = 600 } = options
  // Convert video URL to thumbnail by replacing extension and adding transformations
  return videoUrl.replace('/video/upload/', `/video/upload/w_${width},h_${height},c_fill,so_0/`).replace(/\.\w+$/, '.jpg')
}
