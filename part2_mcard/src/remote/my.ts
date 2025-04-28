export async function uploadProfileImage(file: File) {
  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset', process.env.REACT_APP_PRESET_ID as string);
  const cloudName = process.env.REACT_APP_CLOUD_ID;
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
    {
      method: 'POST',
      body: data,
    },
  );

  return res.json();
}
