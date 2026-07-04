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

/**
 * Find an elderly user using their unique link code.
 */
export async function findElderlyByLinkCode(
  enteredCode: string
): Promise<LinkedElderly> {
  const normalizedCode = enteredCode
    .trim()
    .toUpperCase();

  if (!normalizedCode) {
    throw new Error("Please enter a link code.");
  }

  const elderlyQuery = query(
    collection(db, "users"),
    where("role", "==", "elderly"),
    where("linkCode", "==", normalizedCode),
    limit(1)
  );

  const snapshot = await getDocs(elderlyQuery);

  if (snapshot.empty) {
    throw new Error(
      "No elderly account was found with this link code."
    );
  }

  const elderlyDoc = snapshot.docs[0];
  const data = elderlyDoc.data();

  return {
    uid: data.uid || elderlyDoc.id,
    fullName: data.fullName || "Elderly Member",
    email: data.email || "",
    phone: data.phone || "",
    linkCode: data.linkCode || normalizedCode,
  };
}

/**
 * Connect the currently signed-in family member
 * to an elderly user.
 */
export async function linkFamilyToElderly(
  enteredCode: string,
  relationship: string
): Promise<LinkedElderly> {
  const familyUser = auth.currentUser;

  if (!familyUser) {
    throw new Error(
      "You must be signed in to link an elderly member."
    );
  }

  if (!relationship.trim()) {
    throw new Error(
      "Please enter your relationship."
    );
  }

  const elderly =
    await findElderlyByLinkCode(enteredCode);

  if (elderly.uid === familyUser.uid) {
    throw new Error(
      "You cannot link your account to itself."
    );
  }

  // Check whether this exact connection already exists.
  const existingConnectionQuery = query(
    collection(db, "familyConnections"),
    where("familyId", "==", familyUser.uid),
    where("elderlyId", "==", elderly.uid),
    limit(1)
  );

  const existingConnectionSnapshot =
    await getDocs(existingConnectionQuery);

  if (!existingConnectionSnapshot.empty) {
    throw new Error(
      "This elderly member is already linked to your account."
    );
  }

  await addDoc(
    collection(db, "familyConnections"),
    {
      familyId: familyUser.uid,
      elderlyId: elderly.uid,

      elderlyName: elderly.fullName,

      relationship: relationship
        .trim()
        .toLowerCase(),

      status: "accepted",

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  return elderly;
}

/**
 * Get all elderly users linked to the
 * currently signed-in family member.
 */
export async function getLinkedElderlyIds(): Promise<
  string[]
> {
  const familyUser = auth.currentUser;

  if (!familyUser) {
    throw new Error("User is not signed in.");
  }

  const connectionsQuery = query(
    collection(db, "familyConnections"),
    where("familyId", "==", familyUser.uid),
    where("status", "==", "accepted")
  );

  const snapshot =
    await getDocs(connectionsQuery);

  return snapshot.docs
    .map((connectionDoc) => {
      const data = connectionDoc.data();
      return data.elderlyId as string;
    })
    .filter(Boolean);
}