import { jwtDecode } from 'jwt-decode';

export interface DecodedJwt {
  sub?: string;
  name?: string;
  email?: string;
  roles?: string[] | string;
  exp?: number;
  [i: string]: unknown;
}

export function decodeJwt(token: string): DecodedJwt | null {
  try {
    // get the playload from the token
    //const payload = token.split('.')[1];

    // decode the payload from base64 to json
    //const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));

    // decode the token using the jwt-decode library
    const json = jwtDecode<DecodedJwt>(token);

    return json;
  } catch {
    return null;
  }
}
