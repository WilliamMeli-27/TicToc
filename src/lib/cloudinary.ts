export const CLOUDINARY_CONFIG = {
  cloudName: 'diipwifar',       // depuis ton dashboard Cloudinary
  uploadPreset: 'Storage TicToc', // créer un "Unsigned upload preset"
  baseUrl: 'https://api.cloudinary.com/v1_1',
};

export const getVideoUrl = (publicId: string) =>
  `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/video/upload/${publicId}`;

export const getImageUrl = (publicId: string) =>
  `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${publicId}`;