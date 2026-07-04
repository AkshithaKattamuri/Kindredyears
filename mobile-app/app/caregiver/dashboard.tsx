import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function CaregiverDashboard() {


  return (

    <View style={styles.container}>


      <Text style={styles.title}>
        Caregiver Dashboard
      </Text>


      <Text style={styles.subtitle}>
        Welcome back 👋
      </Text>



      <TouchableOpacity style={styles.card}>

        <Text style={styles.cardText}>
          📩 Booking Requests
        </Text>

      </TouchableOpacity>




      <TouchableOpacity style={styles.card}>

        <Text style={styles.cardText}>
          👵 Patient Details
        </Text>

      </TouchableOpacity>




      <TouchableOpacity style={styles.card}>

        <Text style={styles.cardText}>
          📝 Daily Care Update
        </Text>

      </TouchableOpacity>




      <TouchableOpacity style={styles.card}>

        <Text style={styles.cardText}>
          📍 Patient Location
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
 backgroundColor:"#fff",
},


title:{
 fontSize:30,
 fontWeight:"bold",
},


subtitle:{
 fontSize:18,
 color:"gray",
 marginTop:8,
 marginBottom:30,
},


card:{
 backgroundColor:"#dbeafe",
 padding:22,
 borderRadius:15,
 marginBottom:18,
},


cardText:{
 fontSize:18,
 fontWeight:"600",
},


});