import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function HospitalLocation() {


return(

<View style={styles.container}>


<Text style={styles.title}>
Hospital Location
</Text>



<View style={styles.card}>


<Text style={styles.name}>
🏥 Apollo Hospital
</Text>


<Text style={styles.text}>
Doctor:
</Text>


<Text style={styles.bold}>
Dr. Sharma
</Text>


<Text style={styles.text}>
Specialization:
</Text>


<Text style={styles.bold}>
Cardiologist
</Text>


<Text style={styles.text}>
📍 Address:
</Text>


<Text style={styles.address}>
Jubilee Hills,
Hyderabad,
Telangana
</Text>


<Text style={styles.text}>
Appointment Time:
10 July 2026 - 11:00 AM
</Text>



<TouchableOpacity style={styles.button}>


<Text style={styles.buttonText}>
Open Hospital Map
</Text>


</TouchableOpacity>



</View>



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
marginBottom:25
},


card:{
backgroundColor:"#f1f5f9",
padding:20,
borderRadius:15
},


name:{
fontSize:22,
fontWeight:"bold",
marginBottom:15
},


text:{
fontSize:16,
marginTop:10
},


bold:{
fontSize:18,
fontWeight:"600",
marginBottom:5
},


address:{
fontSize:18,
fontWeight:"600",
marginBottom:15
},


button:{
backgroundColor:"#2563eb",
padding:15,
borderRadius:12,
alignItems:"center",
marginTop:20
},


buttonText:{
color:"white",
fontSize:16,
fontWeight:"bold"
}


});