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



export default function PatientDetails(){


const [activePatients,setActivePatients]=useState<any[]>([]);
const [history,setHistory]=useState<any[]>([]);



useEffect(()=>{


// ACTIVE PATIENTS

const activeQuery=query(
collection(db,"caregiverRequests"),
where("status","==","accepted")
);


const unsubActive=onSnapshot(
activeQuery,
(snapshot)=>{


const data=snapshot.docs.map(doc=>({

id:doc.id,
...doc.data()

}));


setActivePatients(data);


});





// OLD PATIENT HISTORY

const historyQuery=query(
collection(db,"caregiverRequests"),
where("status","in",
["completed","cancelled"])
);



const unsubHistory=onSnapshot(
historyQuery,
(snapshot)=>{


const data=snapshot.docs.map(doc=>({

id:doc.id,
...doc.data()

}));


setHistory(data);


});



return()=>{

unsubActive();
unsubHistory();

};


},[]);




return(

<ScrollView style={styles.container}>


<Text style={styles.title}>
👵 Patient Details
</Text>




<Text style={styles.section}>
🟢 Current Patients
</Text>



{

activePatients.length===0 ?

<Text style={styles.empty}>
No active patients
</Text>


:


activePatients.map((patient)=>(


<View 
key={patient.id}
style={styles.card}
>


<Text style={styles.name}>
👤 {patient.patientName || "Patient"}
</Text>


<Text style={styles.text}>
📦 Plan: {patient.plan}
</Text>


<Text style={styles.text}>
⏰ Time: {patient.preferredTime}
</Text>


<Text style={styles.text}>
📍 Location: {patient.location}
</Text>


<Text style={styles.text}>
Status: Active
</Text>


</View>


))

}





<Text style={styles.section}>
📜 Previous Patients History
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
style={styles.historyCard}
>


<Text style={styles.name}>
👤 {patient.patientName || "Patient"}
</Text>


<Text style={styles.text}>
📦 Plan: {patient.plan}
</Text>


<Text style={styles.text}>
Previous Status: {patient.status}
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
backgroundColor:"#fff",
padding:25,
paddingTop:60,
},


title:{
fontSize:28,
fontWeight:"bold",
marginBottom:25,
},


section:{
fontSize:20,
fontWeight:"700",
marginBottom:15,
marginTop:10,
},


card:{
backgroundColor:"#ECFDF5",
padding:20,
borderRadius:18,
marginBottom:20,
},


historyCard:{
backgroundColor:"#F1F5F9",
padding:20,
borderRadius:18,
marginBottom:20,
},


name:{
fontSize:20,
fontWeight:"bold",
marginBottom:10,
},


text:{
fontSize:16,
marginBottom:8,
},


empty:{
fontSize:16,
color:"gray",
marginBottom:20,
},


});