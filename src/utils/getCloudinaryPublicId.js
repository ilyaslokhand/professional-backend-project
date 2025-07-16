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


// example:

// url = https://res.cloudinary.com/demo/image/upload/v1710000000/my-folder/my-image.jpg
// Is URL me "my-image.jpg" ka public ID hota hai "my-image" (bina extension .jpg ke).
// ImageUrl.split('/')
// 👉 Yeh line URL ko / ke base pe todti hai.
// parts[parts.length - 1]
// filename.split('.')[0]
// 👉 Ab filename ko . ke base pe todta hai:
// "my-image.jpg" => ["my-image", "jpg"]
// Aur .split('.')[0] matlab "my-image"

// Return karta hai publicId
// "my-image"

