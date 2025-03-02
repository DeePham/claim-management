import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";

export const claimService = {
  async getUserClaims(userId) {
    try {
      const q = query(collection(db, "claims"), where("staffId", "==", userId));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error("Failed to fetch claims");
    }
  },
  async createClaim(claimData) {
    try {
      const { projectDuration, ...rest } = claimData;
      const [startDate, endDate] = projectDuration;

      const docRef = await addDoc(collection(db, "claims"), {
        ...rest,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        createdAt: serverTimestamp(),
        status: "Pending",
      });

      return {
        id: docRef.id,
        ...rest,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: "Pending",
      };
    } catch (error) {
      throw new Error("Failed to create claim");
    }
  },
  async saveDraft(claimData) {
    try {
      const { projectDuration, ...rest } = claimData;
      const [startDate, endDate] = projectDuration;

      const docRef = await addDoc(collection(db, "claims"), {
        ...rest,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        createdAt: serverTimestamp(),
        status: "Draft",
      });

      return {
        id: docRef.id,
        ...rest,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        status: "Draft",
      };
    } catch (error) {
      throw new Error("Failed to save draft");
    }
  },
  async updateClaim(id, data) {
    try {
      const claimRef = doc(db, "claims", id);
      await updateDoc(claimRef, data);
      return { id, ...data };
    } catch (error) {
      throw new Error("Failed to update claim");
    }
  },

  async deleteClaim(id) {
    try {
      const claimRef = doc(db, "claims", id);
      await deleteDoc(claimRef);
      return id;
    } catch (error) {
      throw new Error("Failed to delete claim");
    }
  },

  async updateClaimStatus(id, status) {
    try {
      const claimRef = doc(db, "claims", id);
      await updateDoc(claimRef, { status });
      return { id, status };
    } catch (error) {
      throw new Error("Failed to update claim status");
    }
  },
};
