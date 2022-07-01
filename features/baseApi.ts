/*import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5000' }),
  endpoints: (builder) => ({
  }),
})

export default baseApi
*/

//https://us-central1-homiezfoods.cloudfunctions.net/app
//http://localhost:5001/homiezfoods/us-central1/app
const BASE_URL = "https://us-central1-homiezfoods.cloudfunctions.net/app";
export default BASE_URL;
