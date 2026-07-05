import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../../config/firebase";

export async function getLinkedElderlyId(): Promise<string> {
  const familyUser = auth.currentUser;

  if (!familyUser) {
    throw new Error(
      "Family member is not signed in."
    );
  }

  const q = query(
    collection(db, "familyConnections"),
    where("familyId", "==", familyUser.uid),
    where("status", "==", "accepted"),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error(
      "No elderly member is linked to this account."
    );
  }

  const connection =
    snapshot.docs[0].data();

  if (!connection.elderlyId) {
    throw new Error(
      "Linked elderly account is invalid."
    );
  }

  return connection.elderlyId;
}