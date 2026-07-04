import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { useEffect, useState } from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { db } from "../../config/firebase";



export default function VideoCalls(){


const [calls,setCalls]=useState<any[]>([]);



useEffect(()=>{


const q=query(

collection(db,"doctorAppointments"),

where("status","==","accepted")

);



const unsubscribe=onSnapshot(q,(snapshot)=>{


const data=snapshot.docs.map(doc=>({

id:doc.id,

...doc.data()

}));


setCalls(data);


});


return unsubscribe;


},[]);





return(

<ScrollView style={styles.container}>


<Text style={styles.title}>
📹 Video Consultations
</Text>



{

calls.length===0 ?

<Text style={styles.empty}>
No scheduled video calls
</Text>


:


calls.map((call)=>(


<View
key={call.id}
style={styles.card}
>


<Text style={styles.heading}>
Upcoming Video Call
</Text>


<Text style={styles.text}>
👤 Patient: {call.patientName || "Patient"}
</Text>


<Text style={styles.text}>
📅 Date: {call.appointmentDate}
</Text>


<Text style={styles.text}>
⏰ Time: {call.appointmentTime}
</Text>


<Text style={styles.text}>
🩺 Reason: {call.reason}
</Text>



<TouchableOpacity style={styles.button}>


<Text style={styles.buttonText}>
Start Video Call
</Text>


</TouchableOpacity>



</View>


))

}



</ScrollView>


);

}




const styles=StyleSheet.create({


container:{
flex:1,
backgroundColor:"#fff",
padding:25,
paddingTop:60,
},


title:{
fontSize:28,
fontWeight:"bold",
marginBottom:25,
},


card:{
backgroundColor:"#EEF2FF",
padding:20,
borderRadius:18,
marginBottom:20,
},


heading:{
fontSize:20,
fontWeight:"bold",
marginBottom:15,
},


text:{
fontSize:16,
marginBottom:10,
},


button:{
backgroundColor:"#4A3FB5",
padding:15,
borderRadius:12,
alignItems:"center",
marginTop:15,
},


buttonText:{
color:"white",
fontSize:16,
fontWeight:"bold",
},


empty:{
fontSize:18,
color:"gray",
textAlign:"center",
marginTop:100,
},


});