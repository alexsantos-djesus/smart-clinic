import bcrypt from "bcryptjs";
export const hash = (s: string) => bcrypt.hash(s, 10);
export const compare = (s: string, h: string) => bcrypt.compare(s, h);
