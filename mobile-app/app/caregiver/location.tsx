import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function PatientLocation(){


return(

<View style={styles.container}>


<Text style={styles.title}>
📍 Patient Location
</Text>



<View style={styles.mapBox}>

<Text style={styles.icon}>
🗺️
</Text>

<Text style={styles.mapText}>
Patient Location Map
</Text>

</View>



<View style={styles.card}>


<Text style={styles.text}>
👤 Patient Name:
</Text>


<Text style={styles.value}>
--
</Text>


<Text style={styles.text}>
📍 Address:
</Text>


<Text style={styles.value}>
--
</Text>


<Text style={styles.text}>
📞 Contact Number:
</Text>


<Text style={styles.value}>
--
</Text>



<TouchableOpacity style={styles.button}>

<Text style={styles.buttonText}>
Open Maps
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
backgroundColor:"#fff",
},


title:{
fontSize:28,
fontWeight:"bold",
marginBottom:25,
},


mapBox:{
height:220,
backgroundColor:"#dbeafe",
borderRadius:20,
justifyContent:"center",
alignItems:"center",
marginBottom:25,
},


icon:{
fontSize:45,
},


mapText:{
fontSize:18,
fontWeight:"600",
},


card:{
backgroundColor:"#f1f5f9",
padding:20,
borderRadius:15,
},


text:{
fontSize:16,
fontWeight:"600",
marginTop:10,
},


value:{
fontSize:16,
color:"gray",
marginBottom:10,
},


button:{
backgroundColor:"#2563eb",
padding:15,
borderRadius:12,
alignItems:"center",
marginTop:20,
},


buttonText:{
color:"white",
fontWeight:"bold",
},


});