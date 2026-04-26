/** User as exposed to the client — never includes password hash */
export interface UserDTO {
  id: string;
  email: string;
  name: string;
  createdAt: string; // ISO 8601
}

/** Response from login/register endpoints */
export interface AuthResponse {
  accessToken: string;
  user: UserDTO;
}

/** JWT payload structure */
export interface TokenPayload {
  sub: string;   // user id
  email: string;
  iat: number;
  exp: number;
}
