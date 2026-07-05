import { 
  addDoc,
  collection,
  serverTimestamp 
} from "firebase/firestore";

import {
  Alert,
  Text,
  TouchableOpacity
} from "react-native";

import { auth, db } from "../../config/firebase";


export default function BookDoctor(){


async function requestDoctor(){


try{


await addDoc(
collection(db,"doctorAppointments"),
{

patientId: auth.currentUser?.uid,

doctorId:"",

patientName:"",

appointmentDate:"",

appointmentTime:"",

reason:"",

status:"pending",

createdAt:serverTimestamp()

}

);


Alert.alert(
"Appointment Requested",
"Doctor will respond soon"
);


}
catch(error){

console.log(error);

Alert.alert(
"Failed",
"Unable to book appointment"
);

}

}




return(

<TouchableOpacity
onPress={requestDoctor}
>

<Text>
Book Appointment
</Text>

</TouchableOpacity>

);


}