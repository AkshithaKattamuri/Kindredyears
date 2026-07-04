import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function Appointments(){


return(

<View style={styles.container}>


<Text style={styles.title}>
Appointment Requests
</Text>



<View style={styles.card}>


<Text style={styles.name}>
👵 Patient: Lakshmi Devi
</Text>


<Text style={styles.text}>
Problem: Blood Pressure Checkup
</Text>


<Text style={styles.text}>
Date: 10 July 2026
</Text>


<Text style={styles.text}>
Time: 11:00 AM
</Text>



<View style={styles.row}>


<TouchableOpacity style={styles.accept}>

<Text style={styles.btnText}>
Accept
</Text>

</TouchableOpacity>



<TouchableOpacity style={styles.reject}>

<Text style={styles.btnText}>
Reject
</Text>

</TouchableOpacity>


</View>



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
fontSize:20,
fontWeight:"bold",
marginBottom:10
},


text:{
fontSize:16,
marginBottom:8
},


row:{
flexDirection:"row",
gap:15,
marginTop:20
},


accept:{
backgroundColor:"#22c55e",
padding:15,
flex:1,
borderRadius:10,
alignItems:"center"
},


reject:{
backgroundColor:"#ef4444",
padding:15,
flex:1,
borderRadius:10,
alignItems:"center"
},


btnText:{
color:"white",
fontWeight:"bold"
}


});