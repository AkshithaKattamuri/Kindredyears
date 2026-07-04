import { router } from "expo-router";
import { useState } from "react";

import {
  signInWithEmailAndPassword
} from "firebase/auth";

import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "../config/firebase";



export default function SignInScreen() {


const [email,setEmail] = useState("");
const [password,setPassword] = useState("");



async function handleSignIn(){


if(!email.trim() || !password){


Alert.alert(
"Missing Details",
"Please enter email and password"
);


return;

}



try{


const userCredential =
await signInWithEmailAndPassword(
auth,
email.trim(),
password
);



const user = userCredential.user;



const userDoc = await getDoc(
doc(
db,
"users",
user.uid
)
);



if(!userDoc.exists()){


Alert.alert(
"Profile Not Found",
"User profile not found"
);


return;


}



const userData = userDoc.data();


const role =
userData.role?.toLowerCase();


const verificationStatus =
userData.verificationStatus;




// doctor + caregiver approval check

if(
(role === "doctor" ||
role === "caregiver")
&&
verificationStatus !== "approved"
){


Alert.alert(
"Verification Pending",
"Waiting for admin approval"
);


return;


}





// ROUTES


if(role === "elderly"){


router.replace(
"/elderly/elderly-dashboard" as any
);


}



else if(role === "caregiver"){


router.replace(
"/caregiver/dashboard" as any
);


}



else if(role === "doctor"){


router.replace(
"/doctor/dashboard" as any
);


}




else if(role === "admin"){


router.replace(
"/admin/dashboard" as any
);


}



else{


Alert.alert(
"Invalid Role",
"Your account role cannot be recognized"
);


}



}

catch(error:any){


console.log(
"LOGIN ERROR:",
error
);


Alert.alert(
"Login Failed",
error.message
);


}


}







return(

<SafeAreaView style={styles.container}>


<KeyboardAvoidingView
style={{flex:1}}
behavior={
Platform.OS==="ios"
?"padding"
:undefined
}
>


<ScrollView
contentContainerStyle={styles.scroll}
>


<Text style={styles.title}>
Welcome Back
</Text>



<Text style={styles.subtitle}>
Sign in to continue Kindred Years
</Text>





<TextInput

style={styles.input}

placeholder="Email"

value={email}

onChangeText={setEmail}

autoCapitalize="none"

/>





<TextInput

style={styles.input}

placeholder="Password"

value={password}

onChangeText={setPassword}

secureTextEntry

/>





<TouchableOpacity
style={styles.button}
onPress={handleSignIn}
>


<Text style={styles.buttonText}>
Sign In
</Text>


</TouchableOpacity>





<TouchableOpacity
onPress={() =>
router.push("/sign-up")
}
>


<Text style={styles.signup}>
Create Account
</Text>


</TouchableOpacity>




</ScrollView>


</KeyboardAvoidingView>


</SafeAreaView>


);


}







const styles=StyleSheet.create({


container:{

flex:1,

backgroundColor:"#F8F7FF"

},



scroll:{

flexGrow:1,

justifyContent:"center",

padding:25

},



title:{

fontSize:34,

fontWeight:"bold",

marginBottom:10,

color:"#1E1E2F"

},



subtitle:{

fontSize:16,

color:"gray",

marginBottom:30

},



input:{

height:55,

backgroundColor:"white",

borderRadius:14,

paddingHorizontal:15,

fontSize:16,

marginBottom:20,

borderWidth:1,

borderColor:"#DDD"

},



button:{

height:55,

backgroundColor:"#4A3FB5",

borderRadius:14,

justifyContent:"center",

alignItems:"center"

},



buttonText:{

color:"white",

fontSize:17,

fontWeight:"bold"

},



signup:{

textAlign:"center",

marginTop:25,

color:"#4A3FB5",

fontWeight:"bold"

}


});