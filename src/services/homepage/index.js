import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export const newsService = {
  async getNews() {
    try {
      const querySnapshot = await getDocs(collection(db, "news"));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error("Failed to fetch news");
    }
  },
};
