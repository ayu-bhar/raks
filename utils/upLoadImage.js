export const uploadImageWithProgress = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    // 1. Safety Check for Env Variables
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!preset || !cloudName) {
      reject(new Error("Missing Cloudinary Configuration. Check .env.local file."));
      return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", preset);

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
    );

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.secure_url);
      } else {
        console.error("Cloudinary Error:", xhr.responseText);
        reject(new Error("Image upload failed. Check console for details."));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during image upload."));

    xhr.send(formData);
  });
};