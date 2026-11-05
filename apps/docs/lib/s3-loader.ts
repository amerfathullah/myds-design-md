"use client";

import { s3 } from "./constant";

interface S3LoaderProps {
  src: string;
}

// Serves each file as it is, with no Image Optimization API: a file under
// /design/ from public/, anything else from upstream's bucket.
const s3Loader = ({ src }: S3LoaderProps) => {
  // remark-image already resolves Markdown images outside /design/ to
  // CloudFront URLs
  if (/^https?:\/\//.test(src)) return src;
  return s3(src);
};

export default s3Loader;
