// export function getAuthCookieOptions() {
//   return {
//     httpOnly: true,
//     secure: false,      
//     sameSite: "lax",    
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//     path: "/",        
//   } as const;
// }

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}