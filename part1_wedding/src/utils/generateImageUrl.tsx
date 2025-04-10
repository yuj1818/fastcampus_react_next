function generateImageUrl({
  filename,
  format,
  option = 'q_auto,c_fill',
}: {
  filename: string;
  format: 'jpg' | 'webp';
  option?: string;
}) {
  return `https://res.cloudinary.com/ddyglfohj/image/upload/${option}/v1744275798/${format}/${filename}.${format}`;
}

export default generateImageUrl;
