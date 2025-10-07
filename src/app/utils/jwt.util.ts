import { jwtDecode } from 'jwt-decode'

export const decodeToken = (token: any) => {
    if (token) {
        const decodedObj = jwtDecode(token);
        return decodedObj
    }
    return null
}