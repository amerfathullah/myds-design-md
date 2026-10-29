"use client";

interface S3LoaderProps {
  src: string;
}

const s3Loader = ({ src }: S3LoaderProps) => {
  // remark-image already resolves Markdown images to CloudFront URLs
  if (/^https?:\/\//.test(src)) return src;
  return `https://d2391uizq0pg2.cloudfront.net${src}`;
};

export default s3Loader;
