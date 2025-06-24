import authAPI from "@/services/authAPI";
import {config} from "ace-builds";

export const refresh = () => {
    return authAPI.post('/auth/refresh');
}

export const callback = (code) => {
    return authAPI.post('/auth/callback', {code});
}

export const getCurrentUser = () => {
    return authAPI.get('/user/me')
}

export const logout = () => {
    return authAPI.post('/auth/logout');
}
