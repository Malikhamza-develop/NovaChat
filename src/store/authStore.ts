import {create} from 'zustand';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeSocket, disconnectSocket } from '../services/socket/socket';
import { getCurrentUser, updateCurrentUser } from '../services/api/userApi';

const ONBOARDING_STORAGE_KEY = 'has_seen_onboarding';

import {
  User,
  AuthResponse,
} from '../types/Auth';




interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  hasSeenOnboarding: boolean;
  loadAuth: () => Promise<void>;
  finishOnboarding: () => Promise<void>;
  login: (data: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;



}




export const useAuthStore = create<AuthState>((set)=>({



token:null,


user:null,


loading:true,
hasSeenOnboarding:false,




// Restore authentication when app opens

loadAuth:async()=>{


try{


const token =
await AsyncStorage.getItem("token");


const user =
await AsyncStorage.getItem("user");


const onboarding =
await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);


if(token && user){

const storedUser = JSON.parse(user) as User;


set({

token,

user:storedUser,

loading:false,

hasSeenOnboarding:onboarding === 'true',

});

      try{
        initializeSocket(token);
      }catch(e){
        console.log('Socket init error:', e);
      }

      try {
        const currentUser = await getCurrentUser();
        await AsyncStorage.setItem('user', JSON.stringify(currentUser));
        set({ user: currentUser });
      } catch (error) {
        console.log('Profile refresh error:', error);
      }


}

else{


set({

token:null,

user:null,

loading:false,

});


}



}

catch(error){


console.log(
"Auth restore error:",
error
);



set({

token:null,

user:null,

loading:false,

});


}



},





// Save authentication after login/register

login:async(data)=>{


await AsyncStorage.setItem(

"token",

data.token

);



await AsyncStorage.setItem(

"user",

JSON.stringify(data.user)

);




set({

token:data.token,

user:data.user,

});

    try{
      initializeSocket(data.token);
    }catch(e){
      console.log('Socket init error:', e);
    }

  },

  finishOnboarding:async()=>{
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    set({ hasSeenOnboarding: true });
  },


updateProfile:async(updates)=>{
  const currentUser = useAuthStore.getState().user;
  if (!currentUser) return;

  const nextUser = await updateCurrentUser({
    name: updates.name ?? currentUser.name,
    avatar: updates.avatar ?? currentUser.avatar,
  });

  await AsyncStorage.setItem('user', JSON.stringify(nextUser));
  set({ user: nextUser });
},


// Remove authentication

logout:async()=>{


await AsyncStorage.removeItem(
"token"
);


await AsyncStorage.removeItem(
"user"
);

disconnectSocket();



set({

token:null,

user:null,

});


},



}));
