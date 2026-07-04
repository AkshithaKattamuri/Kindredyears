import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function PatientLocation() {


return(

<View style={styles.container}>


<Text style={styles.title}>
Patient Location
</Text>



<View style={styles.card}>


<Text style={styles.name}>
👵 Lakshmi Devi
</Text>


<Text style={styles.text}>
📍 Address:
</Text>


<Text style={styles.address}>
Hitech City,
Hyderabad,
Telangana
</Text>


<Text style={styles.text}>
Distance: 4.5 km away
</Text>


<Text style={styles.text}>
Visit Time: 5:00 PM
</Text>



<TouchableOpacity style={styles.button}>


<Text style={styles.buttonText}>
Open Map
</Text>


</TouchableOpacity>



</View>


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
fontSize:17,
marginBottom:10
},


address:{
fontSize:18,
fontWeight:"600",
marginBottom:20
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
fontWeight:"bold",
fontSize:16
}


});