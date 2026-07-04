import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";


export default function CareUpdate() {


return (

<View style={styles.container}>


<Text style={styles.title}>
📝 Daily Care Update
</Text>


<View style={styles.card}>


<Text style={styles.label}>
Patient Name
</Text>

<TextInput
style={styles.input}
placeholder="Enter patient name"
/>


<Text style={styles.label}>
Health Status
</Text>

<TextInput
style={styles.input}
placeholder="Enter current health status"
/>


<Text style={styles.label}>
Medicine Taken
</Text>

<TextInput
style={styles.input}
placeholder="Yes / No"
/>


<Text style={styles.label}>
Food Intake
</Text>

<TextInput
style={styles.input}
placeholder="Enter food details"
/>


<Text style={styles.label}>
Physical Activity
</Text>

<TextInput
style={styles.input}
placeholder="Walking / Exercise details"
/>


<Text style={styles.label}>
Mental Health Update
</Text>

<TextInput
style={styles.bigInput}
placeholder="Enter mood and observations"
multiline
/>


<TouchableOpacity style={styles.button}>

<Text style={styles.buttonText}>
Send Update to Family
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
backgroundColor:"#fff",
},


title:{
fontSize:28,
fontWeight:"bold",
marginBottom:25,
},


card:{
backgroundColor:"#f1f5f9",
padding:20,
borderRadius:15,
},


label:{
fontSize:16,
fontWeight:"600",
marginBottom:6,
},


input:{
backgroundColor:"white",
padding:12,
borderRadius:10,
marginBottom:15,
fontSize:16,
},


bigInput:{
backgroundColor:"white",
height:100,
padding:12,
borderRadius:10,
marginBottom:20,
fontSize:16,
},


button:{
backgroundColor:"#4A3FB5",
padding:15,
borderRadius:12,
alignItems:"center",
},


buttonText:{
color:"white",
fontWeight:"bold",
fontSize:16,
},


});