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
  View,
} from "react-native";

import { db } from "../../config/firebase";



export default function DoctorPatients(){


const [patients,setPatients] = useState<any[]>([]);
const [history,setHistory] = useState<any[]>([]);



useEffect(()=>{


// Accepted appointments

const activeQuery = query(
collection(db,"doctorAppointments"),
where("status","==","accepted")
);



const unsub1 = onSnapshot(
activeQuery,
(snapshot)=>{


const data=snapshot.docs.map(doc=>({

id:doc.id,
...doc.data()

}));

setPatients(data);

});




// Previous appointments

const historyQuery=query(

collection(db,"doctorAppointments"),

where("status","==","completed")

);



const unsub2=onSnapshot(
historyQuery,
(snapshot)=>{


const data=snapshot.docs.map(doc=>({

id:doc.id,
...doc.data()

}));


setHistory(data);


});



return()=>{

unsub1();
unsub2();

};


},[]);




return(

<ScrollView style={styles.container}>


<Text style={styles.title}>
👨‍⚕️ Patient Details
</Text>





<Text style={styles.section}>
🟢 Current Patients
</Text>



{

patients.length===0 ?


<Text style={styles.empty}>
No accepted patients
</Text>


:


patients.map((patient)=>(


<View 
key={patient.id}
style={styles.card}
>


<Text style={styles.name}>
👤 {patient.patientName || "Patient"}
</Text>


<Text style={styles.text}>
📅 Appointment:
{patient.appointmentDate}
</Text>


<Text style={styles.text}>
⏰ Time:
{patient.appointmentTime}
</Text>


<Text style={styles.text}>
🩺 Problem:
{patient.reason}
</Text>


<Text style={styles.text}>
📄 Reports available
</Text>



</View>


))

}





<Text style={styles.section}>
📜 Patient History
</Text>



{

history.length===0 ?

<Text style={styles.empty}>
No previous patients
</Text>


:


history.map((patient)=>(


<View
key={patient.id}
style={styles.history}
>


<Text style={styles.name}>
👤 {patient.patientName}
</Text>


<Text style={styles.text}>
Completed Appointment
</Text>


</View>


))

}



</ScrollView>


);

}




const styles=StyleSheet.create({


container:{
flex:1,
padding:25,
paddingTop:60,
backgroundColor:"#fff"
},


title:{
fontSize:28,
fontWeight:"bold",
marginBottom:25
},


section:{
fontSize:20,
fontWeight:"700",
marginBottom:15
},


card:{
backgroundColor:"#ECFDF5",
padding:20,
borderRadius:18,
marginBottom:20
},


history:{
backgroundColor:"#F1F5F9",
padding:20,
borderRadius:18,
marginBottom:20
},


name:{
fontSize:20,
fontWeight:"bold",
marginBottom:10
},


text:{
fontSize:16,
marginBottom:8
},


empty:{
fontSize:16,
color:"gray",
marginBottom:20
}


});