import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export const projectService = {
  async getProjects() {
    try {
      const querySnapshot = await getDocs(collection(db, "projects"));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting projects:", error);
      throw error;
    }
  }
};