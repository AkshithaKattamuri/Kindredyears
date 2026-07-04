import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function Index() {


  return (

    <View style={styles.container}>


      <Text style={styles.title}>
        Kindred Years
      </Text>


      <Text style={styles.subtitle}>
        Elder Care Made Simple
      </Text>



      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/sign-in")}
      >

        <Text style={styles.buttonText}>
          Sign In
        </Text>

      </TouchableOpacity>



      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/sign-up")}
      >

        <Text style={styles.buttonText}>
          Create Account
        </Text>

      </TouchableOpacity>



    </View>

  );

}



const styles = StyleSheet.create({

container:{
 flex:1,
 justifyContent:"center",
 alignItems:"center",
 padding:25,
 backgroundColor:"#fff",
},


title:{
 fontSize:36,
 fontWeight:"bold",
 marginBottom:10,
},


subtitle:{
 fontSize:18,
 color:"gray",
 marginBottom:40,
},


button:{
 backgroundColor:"#4A3FB5",
 padding:18,
 borderRadius:15,
 width:"100%",
 alignItems:"center",
 marginBottom:15,
},


buttonText:{
 color:"white",
 fontSize:18,
 fontWeight:"bold",
},


});