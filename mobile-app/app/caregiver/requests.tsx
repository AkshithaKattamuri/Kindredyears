import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function BookingRequests() {


  return (

    <View style={styles.container}>


      <Text style={styles.title}>
        Booking Requests
      </Text>



      <View style={styles.card}>


        <Text style={styles.name}>
          👵 Patient: Lakshmi Devi
        </Text>


        <Text style={styles.text}>
          Age: 72 years
        </Text>


        <Text style={styles.text}>
          Service Needed: Daily Care Assistance
        </Text>


        <Text style={styles.text}>
          Date: 5 July 2026
        </Text>


        <Text style={styles.text}>
          Time: 5:00 PM
        </Text>


        <Text style={styles.text}>
          Location: Hyderabad
        </Text>



        <View style={styles.buttonRow}>


          <TouchableOpacity style={styles.acceptBtn}>

            <Text style={styles.buttonText}>
              Accept
            </Text>

          </TouchableOpacity>



          <TouchableOpacity style={styles.rejectBtn}>

            <Text style={styles.buttonText}>
              Reject
            </Text>

          </TouchableOpacity>


        </View>


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


name:{
 fontSize:20,
 fontWeight:"bold",
 marginBottom:15,
},


text:{
 fontSize:16,
 marginBottom:8,
},


buttonRow:{
 flexDirection:"row",
 marginTop:20,
 gap:15,
},


acceptBtn:{
 backgroundColor:"#22c55e",
 padding:15,
 borderRadius:10,
 flex:1,
 alignItems:"center",
},


rejectBtn:{
 backgroundColor:"#ef4444",
 padding:15,
 borderRadius:10,
 flex:1,
 alignItems:"center",
},


buttonText:{
 color:"white",
 fontWeight:"bold",
 fontSize:16,
},


});