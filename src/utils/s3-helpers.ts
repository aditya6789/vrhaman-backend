export const getS3FileUrl = (region: string, bucket: string, key: string) => {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};
