import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function VideoConsultation() {


return(

<View style={styles.container}>


<Text style={styles.title}>
Video Consultation
</Text>



<View style={styles.videoBox}>


<Text style={styles.icon}>
🎥
</Text>


<Text style={styles.waiting}>
Waiting for consultation...
</Text>


</View>



<View style={styles.card}>


<Text style={styles.name}>
👵 Patient: Lakshmi Devi
</Text>


<Text style={styles.text}>
Doctor: Dr. Sharma
</Text>


<Text style={styles.text}>
Appointment:
10 July 2026
</Text>


<Text style={styles.text}>
Time: 11:00 AM
</Text>



</View>




<TouchableOpacity style={styles.startButton}>


<Text style={styles.buttonText}>
Start Video Call
</Text>


</TouchableOpacity>




<TouchableOpacity style={styles.endButton}>


<Text style={styles.buttonText}>
End Call
</Text>


</TouchableOpacity>



</View>

);

}



const styles = StyleSheet.create({


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


videoBox:{
height:220,
backgroundColor:"#e5e7eb",
borderRadius:15,
justifyContent:"center",
alignItems:"center",
marginBottom:25
},


icon:{
fontSize:50
},


waiting:{
fontSize:18,
marginTop:10
},


card:{
backgroundColor:"#f1f5f9",
padding:20,
borderRadius:15,
marginBottom:25
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


startButton:{
backgroundColor:"#22c55e",
padding:16,
borderRadius:12,
alignItems:"center",
marginBottom:15
},


endButton:{
backgroundColor:"#ef4444",
padding:16,
borderRadius:12,
alignItems:"center"
},


buttonText:{
color:"white",
fontSize:16,
fontWeight:"bold"
}


});