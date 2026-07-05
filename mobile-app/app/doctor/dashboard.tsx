import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function DoctorDashboard(){

const router = useRouter();


return(

<View style={styles.container}>


<Text style={styles.title}>
Doctor Dashboard
</Text>


<Text style={styles.subtitle}>
Welcome Doctor 👨‍⚕️
</Text>



<TouchableOpacity
style={styles.card}
onPress={()=>router.push("/doctor/appointments")}
>

<Text style={styles.cardText}>
📅 Appointments
</Text>

</TouchableOpacity>



<TouchableOpacity
style={styles.card}
onPress={()=>router.push("/doctor/patient")}
>

<Text style={styles.cardText}>
👵 Patient Details
</Text>

</TouchableOpacity>


<TouchableOpacity
style={styles.card}
onPress={()=>router.push("/doctor/video")}
>

<Text style={styles.cardText}>
📹 Video Consultation
</Text>

</TouchableOpacity>



<TouchableOpacity
style={styles.card}
onPress={()=>router.push("/doctor/location")}
>

<Text style={styles.cardText}>
📍 Hospital Location
</Text>

</TouchableOpacity>



</View>

);

}



const styles=StyleSheet.create({

container:{
flex:1,
padding:25,
paddingTop:60,
backgroundColor:"#fff",
},


title:{
fontSize:30,
fontWeight:"bold",
},


subtitle:{
fontSize:18,
color:"gray",
marginTop:8,
marginBottom:30,
},


card:{
backgroundColor:"#dbeafe",
padding:22,
borderRadius:15,
marginBottom:18,
},


cardText:{
fontSize:18,
fontWeight:"600",
},


});