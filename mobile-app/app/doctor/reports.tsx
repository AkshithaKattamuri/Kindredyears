import { StyleSheet, Text, View } from "react-native";


export default function Reports(){


return(

<View style={styles.container}>


<Text style={styles.title}>
Medical Reports
</Text>


<View style={styles.card}>

<Text style={styles.text}>
📄 Blood Test Report.pdf
</Text>


<Text style={styles.text}>
📄 Diabetes Report.pdf
</Text>


<Text style={styles.text}>
📄 Prescription.pdf
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


text:{
fontSize:18,
marginBottom:15
}


});