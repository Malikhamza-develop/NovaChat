import React, {useState} from 'react';


import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';



import {
  useForm,
  Controller,
} from 'react-hook-form';



import {
  zodResolver,
} from '@hookform/resolvers/zod';



import {
  registerSchema,
  RegisterFormData,
} from '../../validation/authSchemas';



import {
  registerUser,
} from '../../services/api/authApi';



import {
  useAuthStore,
} from '../../store/authStore';



import AuthInput from '../../components/auth/AuthInput';

import PasswordInput from '../../components/auth/PasswordInput';

import AuthButton from '../../components/auth/AuthButton';



import colors from '../../theme/colors';



import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';



import {
  AuthStackParamList,
} from '../../navigation/types';





type Props =
NativeStackScreenProps<
AuthStackParamList,
'Register'
>;







const RegisterScreen = ({
navigation,
}:Props)=>{



const [error,setError] =
useState("");



const login =
useAuthStore(
state=>state.login
);






const {
control,
handleSubmit,
formState:{
errors,
isSubmitting
}

}=useForm<RegisterFormData>({

resolver:
zodResolver(registerSchema),


defaultValues:{

name:"",

email:"",

password:"",

confirmPassword:"",

},


});








const onSubmit = async(
data:RegisterFormData
)=>{


try{


setError("");



const response =
await registerUser({

name:data.name,

email:data.email,

password:data.password,

});



await login(response);
console.log("REGISTER TOKEN:", useAuthStore.getState().token);




}

catch (error: any) {
  console.log("========== REGISTER ERROR ==========");
  console.log(error);
  console.log("message:", error?.message);
  console.log("response:", error?.response?.data);
  console.log("stack:", error?.stack);
  console.log("====================================");

  setError(
    error?.response?.data?.message ??
    error?.message ??
    "Registration failed"
  );
}



};









return(


<KeyboardAvoidingView

style={styles.container}

behavior={
Platform.OS==="ios"
?
"padding"
:
undefined
}

>



<ScrollView

contentContainerStyle={styles.content}

keyboardShouldPersistTaps="handled"

>



<Text style={styles.title}>
Create Account
</Text>



<Text style={styles.subtitle}>
Join NovaChat today
</Text>





{
error ?

<Text style={styles.error}>
{error}
</Text>

:

null

}








<Controller

control={control}

name="name"

render={({field:{value,onChange}})=>(

<>

<AuthInput

value={value}

placeholder="Full Name"

onChangeText={onChange}

/>



{
errors.name &&

<Text style={styles.fieldError}>
{errors.name.message}
</Text>

}



</>

)}

/>








<Controller

control={control}

name="email"

render={({field:{value,onChange}})=>(

<>

<AuthInput

value={value}

placeholder="Email"

keyboardType="email-address"

autoCapitalize="none"

onChangeText={onChange}

/>




{
errors.email &&

<Text style={styles.fieldError}>
{errors.email.message}
</Text>

}



</>

)}

/>








<Controller

control={control}

name="password"

render={({field:{value,onChange}})=>(

<>

<PasswordInput

value={value}

placeholder="Password"

onChangeText={onChange}

/>




{
errors.password &&

<Text style={styles.fieldError}>
{errors.password.message}
</Text>

}



</>

)}

/>








<Controller

control={control}

name="confirmPassword"

render={({field:{value,onChange}})=>(

<>

<PasswordInput

value={value}

placeholder="Confirm Password"

onChangeText={onChange}

/>




{
errors.confirmPassword &&

<Text style={styles.fieldError}>
{errors.confirmPassword.message}
</Text>

}



</>

)}

/>








<AuthButton

title="Register"

loading={isSubmitting}

onPress={
handleSubmit(onSubmit)
}

/>







<Text

style={styles.login}

onPress={()=>
navigation.navigate("Login")
}

>

Already have an account? Login

</Text>







</ScrollView>


</KeyboardAvoidingView>


);


};





export default RegisterScreen;









const styles = StyleSheet.create({



container:{

flex:1,

backgroundColor:colors.background,

},




content:{

flexGrow:1,

justifyContent:"center",

padding:24,

},




title:{

fontSize:32,

fontWeight:"800",

color:colors.text,

marginBottom:8,

},




subtitle:{

fontSize:16,

color:colors.textSecondary,

marginBottom:25,

},




error:{

color:colors.danger,

fontSize:14,

marginBottom:15,

},




fieldError:{

color:colors.danger,

fontSize:13,

marginTop:-10,

marginBottom:10,

},




login:{

marginTop:25,

textAlign:"center",

fontSize:15,

fontWeight:"600",

color:colors.primary,

},



});