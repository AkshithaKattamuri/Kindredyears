import { 
collection,
onSnapshot,
query,
where,
doc,
updateDoc
} from "firebase/firestore";

import { useEffect, useState } from "react";

import {
StyleSheet,
Text,
TouchableOpacity,
View
} from "react-native";

import { db } from "../../config/firebase";



export default function BookingRequests(){


const [requests,setRequests]=useState<any[]>([]);



useEffect(()=>{


const q=query(
collection(db,"caregiverRequests"),
where("status","==","pending")
);



const unsubscribe=onSnapshot(q,(snapshot)=>{


const data=snapshot.docs.map(doc=>({

id:doc.id,
...doc.data()

}));

console.log("REQUESTS FOUND:", data);
setRequests(data);


});



return unsubscribe;


},[]);





async function updateStatus(id:string,status:string){


await updateDoc(
doc(db,"caregiverRequests",id),
{

status:status

}

);


}





return(

<View style={styles.container}>


<Text style={styles.title}>
🔔 Notifications
</Text>



{
requests.length===0 ?


<Text style={styles.empty}>
No new caregiver requests
</Text>


:


requests.map((item)=>(


<View 
style={styles.card}
key={item.id}
>


<Text style={styles.heading}>
New Caregiver Booking
</Text>


<Text style={styles.text}>
A family member requested your service
</Text>


<Text style={styles.text}>
📦 Plan: {item.plan}
</Text>


<Text style={styles.text}>
⏰ Time: {item.preferredTime}
</Text>


<Text style={styles.text}>
📍 Location: {item.location}
</Text>




<View style={styles.row}>


<TouchableOpacity
style={styles.accept}
onPress={()=>updateStatus(item.id,"accepted")}
>

<Text style={styles.btn}>
Accept
</Text>

</TouchableOpacity>



<TouchableOpacity
style={styles.reject}
onPress={()=>updateStatus(item.id,"rejected")}
>

<Text style={styles.btn}>
Reject
</Text>

</TouchableOpacity>


</View>



</View>


))

}


</View>

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
marginBottom:30
},


card:{
backgroundColor:"#EEF2FF",
padding:20,
borderRadius:20,
marginBottom:20
},


heading:{
fontSize:20,
fontWeight:"bold",
marginBottom:10
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