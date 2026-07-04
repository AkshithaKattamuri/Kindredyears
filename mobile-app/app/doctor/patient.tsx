import { StyleSheet, Text, View } from "react-native";


export default function DoctorPatient(){


return(

<View style={styles.container}>


<Text style={styles.title}>
Patient Details
</Text>



<View style={styles.card}>


<Text style={styles.name}>
👵 Lakshmi Devi
</Text>


<Text style={styles.text}>
Age: 72
</Text>


<Text style={styles.text}>
Blood Group: O+
</Text>


<Text style={styles.text}>
Health Issues: Diabetes, High BP
</Text>


<Text style={styles.text}>
Current Medicine: BP Tablet
</Text>


</View>


</View>

);

}




const styles=StyleSheet.create({

container:{
flex:1,
padding:25,
paddingTop:60
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
}


});