function getCloudinaryPublicId(ImageUrl){
  try {
    const parts = ImageUrl.split('/');
    const filename  = parts[parts.length -1];
    const publicId = filename.split('.')[0];
    return publicId;
  } catch (error) {
    return null;
  }
}

export default getCloudinaryPublicId;