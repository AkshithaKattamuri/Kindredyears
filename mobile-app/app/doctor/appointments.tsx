import {
collection,
doc,
onSnapshot,
query,
updateDoc,
where
} from "firebase/firestore";


import { useEffect, useState } from "react";


import {
ScrollView,
StyleSheet,
Text,
TouchableOpacity,
View
} from "react-native";


import { db } from "../../config/firebase";




export default function DoctorAppointments(){


const [appointments,setAppointments]=useState<any[]>([]);



useEffect(()=>{


const q=query(

collection(db,"doctorAppointments"),

where("status","==","pending")

);



const unsubscribe=onSnapshot(q,(snapshot)=>{


const data=snapshot.docs.map(doc=>({

id:doc.id,

...doc.data()

}));


setAppointments(data);


});


return unsubscribe;


},[]);





async function changeStatus(id:string,status:string){


await updateDoc(

doc(db,"doctorAppointments",id),

{

status:status

}

);


}







return(


<ScrollView style={styles.container}>


<Text style={styles.title}>
🔔 Appointment Requests
</Text>



{

appointments.length===0 ?

<Text style={styles.empty}>
No new appointments
</Text>


:


appointments.map((item)=>(


<View
key={item.id}
style={styles.card}
>


<Text style={styles.heading}>
New Doctor Appointment
</Text>


<Text style={styles.text}>
👤 Patient: {item.patientName || "Patient"}
</Text>


<Text style={styles.text}>
📅 Date: {item.appointmentDate}
</Text>


<Text style={styles.text}>
⏰ Time: {item.appointmentTime}
</Text>


<Text style={styles.text}>
🩺 Reason: {item.reason}
</Text>




<View style={styles.row}>


<TouchableOpacity
style={styles.accept}

onPress={()=>
changeStatus(item.id,"accepted")
}
>

<Text style={styles.btn}>
Accept
</Text>

</TouchableOpacity>





<TouchableOpacity
style={styles.reject}

onPress={()=>
changeStatus(item.id,"rejected")
}

>

<Text style={styles.btn}>
Reject
</Text>

</TouchableOpacity>



</View>


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
paddingTop:60
},



title:{
fontSize:28,
fontWeight:"bold",
marginBottom:25
},



card:{
backgroundColor:"#EEF2FF",
padding:20,
borderRadius:18,
marginBottom:20
},



heading:{
fontSize:20,
fontWeight:"bold",
marginBottom:15
},



text:{
fontSize:16,
marginBottom:10
},



row:{
flexDirection:"row",
gap:15,
marginTop:15
},



accept:{
flex:1,
backgroundColor:"#22c55e",
padding:14,
borderRadius:12,
alignItems:"center"
},



reject:{
flex:1,
backgroundColor:"#ef4444",
padding:14,
borderRadius:12,
alignItems:"center"
},



btn:{
color:"white",
fontWeight:"bold"
},



empty:{
fontSize:18,
color:"gray",
textAlign:"center",
marginTop:100
}


});