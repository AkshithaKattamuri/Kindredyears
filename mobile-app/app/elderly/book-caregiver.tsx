import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { useState } from "react";

import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "../../config/firebase";


export default function BookCaregiver() {

  const [name, setName] = useState("");
  const [plan, setPlan] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");


  const sendRequest = async () => {

    try {

      const docRef = await addDoc(
        collection(db, "caregiverRequests"),
        {

          familyId: auth.currentUser?.uid || "",

          patientName: name,

          plan: plan,

          preferredTime: time,

          location: location,

          status: "pending",

          createdAt: serverTimestamp(),

        }
      );


      console.log(
        "FIREBASE CREATED ID:",
        docRef.id
      );


      Alert.alert(
        "Success",
        "Caregiver request sent"
      );


      setName("");
      setPlan("");
      setTime("");
      setLocation("");


    } catch (error) {

      console.log(
        "FIREBASE ERROR:",
        error
      );


      Alert.alert(
        "Error",
        "Request failed"
      );

    }

  };



  return (

    <View style={styles.container}>


      <Text style={styles.title}>
        Book Caregiver
      </Text>


      <TextInput
        style={styles.input}
        placeholder="Patient Name"
        value={name}
        onChangeText={setName}
      />


      <TextInput
        style={styles.input}
        placeholder="Weekly / Monthly"
        value={plan}
        onChangeText={setPlan}
      />


      <TextInput
        style={styles.input}
        placeholder="Preferred Time"
        value={time}
        onChangeText={setTime}
      />


      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />


      <TouchableOpacity
        style={styles.button}
        onPress={sendRequest}
      >

        <Text style={styles.buttonText}>
          Send Request
        </Text>

      </TouchableOpacity>


    </View>

  );

}



const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 25,
    paddingTop: 60,
    backgroundColor: "#fff",
  },


  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 30,
  },


  input: {
    backgroundColor: "#f1f5f9",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },


  button: {
    backgroundColor: "#4A3FB5",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },


  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

});