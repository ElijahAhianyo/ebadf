const CLOUD_NAME = "dbu0ho5ci";

export function cloudinaryFetch(imageUrl: string, opts?: { w?: number; h?: number; crop?: string }) {
  const transforms = [
    opts?.w ? `w_${opts.w}` : null,
    opts?.h ? `h_${opts.h}` : null,
    opts?.crop ? `c_${opts.crop}` : "c_fill",
    "f_auto",
    "q_auto"
  ]
    .filter(Boolean)
    .join(",");

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${transforms}/${encodeURIComponent(imageUrl)}`;
}
