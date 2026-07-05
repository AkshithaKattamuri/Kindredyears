import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { auth, db } from "../../config/firebase";

export type LinkedElderly = {
  uid: string;
  fullName: string;
  email?: string;
  phone?: string;
  linkCode: string;
};

export async function findElderlyByLinkCode(
  enteredCode: string
): Promise<LinkedElderly> {
  const normalizedCode = enteredCode
    .trim()
    .toUpperCase();

  if (!normalizedCode) {
    throw new Error("Please enter a link code.");
  }

  const q = query(
    collection(db, "users"),
    where("role", "==", "elderly"),
    where("linkCode", "==", normalizedCode),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error(
      "No elderly account found with this link code."
    );
  }

  const elderlyDoc = snapshot.docs[0];
  const data = elderlyDoc.data();

  return {
    uid: elderlyDoc.id,
    fullName: data.fullName || "Elderly Member",
    email: data.email || "",
    phone: data.phone || "",
    linkCode: data.linkCode || normalizedCode,
  };
}

export async function linkFamilyToElderly(
  enteredCode: string,
  relationship: string
): Promise<LinkedElderly> {
  const familyUser = auth.currentUser;

  if (!familyUser) {
    throw new Error("Please sign in again.");
  }

  const elderly =
    await findElderlyByLinkCode(enteredCode);

  const existingQuery = query(
    collection(db, "familyConnections"),
    where("familyId", "==", familyUser.uid),
    where("elderlyId", "==", elderly.uid),
    limit(1)
  );

  const existingSnapshot =
    await getDocs(existingQuery);

  if (!existingSnapshot.empty) {
    throw new Error(
      "This elderly member is already linked."
    );
  }

  await addDoc(
    collection(db, "familyConnections"),
    {
      familyId: familyUser.uid,
      elderlyId: elderly.uid,
      elderlyName: elderly.fullName,
      relationship:
        relationship.trim() || "family",
      status: "accepted",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  return elderly;
}