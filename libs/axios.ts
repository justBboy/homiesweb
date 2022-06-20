import axios from "axios";
import BASE_URL from "../features/baseApi";

const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000
})

export default instance;