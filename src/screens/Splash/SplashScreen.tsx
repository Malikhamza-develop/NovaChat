import React from 'react';

import {
View,
Text,
StyleSheet,
} from 'react-native';


import colors from '../../theme/colors';



const SplashScreen=()=>{


return(

<View style={styles.container}>


<Text style={styles.logo}>
NovaChat
</Text>


</View>

);


};



export default SplashScreen;



const styles=StyleSheet.create({

container:{

flex:1,

justifyContent:'center',

alignItems:'center',

backgroundColor:colors.primary,

},



logo:{

fontSize:40,

fontWeight:'800',

color:colors.white,

},


});