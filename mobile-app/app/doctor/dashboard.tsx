import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function DoctorDashboard() {


return(

<View style={styles.container}>


<Text style={styles.title}>
Doctor Dashboard
</Text>


<Text style={styles.subtitle}>
Welcome Doctor 👨‍⚕️
</Text>



<TouchableOpacity style={styles.card}>

<Text style={styles.cardText}>
📅 Appointment Requests
</Text>

</TouchableOpacity>



<TouchableOpacity style={styles.card}>

<Text style={styles.cardText}>
👵 Patient Details
</Text>

</TouchableOpacity>



<TouchableOpacity style={styles.card}>

<Text style={styles.cardText}>
📄 Medical Reports
</Text>

</TouchableOpacity>



<TouchableOpacity style={styles.card}>

<Text style={styles.cardText}>
🎥 Video Consultation
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
backgroundColor:"#fff"
},


title:{
fontSize:30,
fontWeight:"bold"
},


subtitle:{
fontSize:18,
color:"gray",
marginBottom:30,
marginTop:8
},


card:{
backgroundColor:"#dcfce7",
padding:22,
borderRadius:15,
marginBottom:18
},


cardText:{
fontSize:18,
fontWeight:"600"
}


});