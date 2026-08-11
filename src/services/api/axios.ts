import axios from 'axios';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/environment';



const api = axios.create({

baseURL: API_URL,

timeout:10000,

headers:{

"Content-Type":"application/json",

},

});




// Attach JWT automatically
api.interceptors.request.use(
  async (config) => {
    let token: string | null = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem("token");
    }
    if (!token) {
      try {
        token = await AsyncStorage.getItem("token");
      } catch (e) {
        // Ignore async-storage errors in web environment
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);






// Global error handling

api.interceptors.response.use(

(response)=>response,


(error)=>{


if(error.response){

console.log(
"API Error:",
error.response.data
);

}

else{

console.log(
"Network Error:",
error.message
);

}



return Promise.reject(error);


}

);



export default api;
