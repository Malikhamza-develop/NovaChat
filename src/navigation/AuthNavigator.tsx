import React from 'react';

import {
createNativeStackNavigator,
} from '@react-navigation/native-stack';


import LoginScreen from '../screens/Login/LoginScreen';
import RegisterScreen from '../screens/Register/RegisterScreen';


import {
AuthStackParamList,
} from './types';



const Stack =
createNativeStackNavigator<AuthStackParamList>();



const AuthNavigator=()=>{


return(

<Stack.Navigator
id="AuthStack"
screenOptions={{
headerShown:false
}}
>


<Stack.Screen

name="Login"

component={LoginScreen}

/>


<Stack.Screen

name="Register"

component={RegisterScreen}

/>


</Stack.Navigator>

);


};


export default AuthNavigator;