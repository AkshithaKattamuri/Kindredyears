import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";


export default function CareUpdate() {


return(

<View style={styles.container}>


<Text style={styles.title}>
Daily Care Update
</Text>



<TextInput
style={styles.input}
placeholder="Physical activity"
/>


<TextInput
style={styles.input}
placeholder="Meals taken"
/>


<TextInput
style={styles.input}
placeholder="Mood / Well-being"
/>


<TextInput
style={styles.note}
placeholder="Caregiver notes"
multiline
/>



<TouchableOpacity style={styles.button}>

<Text style={styles.btnText}>
Submit Update
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
fontSize:28,
fontWeight:"bold",
marginBottom:25
},


input:{
borderWidth:1,
borderColor:"#ccc",
padding:15,
borderRadius:10,
marginBottom:15
},


note:{
borderWidth:1,
borderColor:"#ccc",
padding:15,
height:120,
borderRadius:10,
marginBottom:20
},


button:{
backgroundColor:"#2563eb",
padding:18,
borderRadius:12,
alignItems:"center"
},


btnText:{
color:"white",
fontWeight:"bold",
fontSize:16
}


});