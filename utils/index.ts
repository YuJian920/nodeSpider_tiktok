/**
 * 从 URL 中拆出 Sec_id
 * @param userUrl
 * @returns
 */
export const getTiktokSecId = (userUrl: string) => {
  const reg = /(?<=user\/).*(?=\?)/g;
  const result = userUrl.match(reg);
  if (result) return result[0];
  return null;
};
