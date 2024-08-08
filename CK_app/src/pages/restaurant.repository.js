// restaurant.repository.js
/*
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";
import { fetchRestaurantData } from "./restaurant.service";

export const initializeRestaurantData = async () => {
  try {
    const db = getFirestore();
    const restaurantData = await fetchRestaurantData();

    for (const restaurant of restaurantData) {
      const restaurantRef = doc(db, "Restaurants", restaurant.name);
      const restaurantDoc = await getDoc(restaurantRef);

      if (!restaurantDoc.exists()) {
        await setDoc(restaurantRef, {
          name: restaurant.name,
          totalScore: 0,
          numberOfRatings: 0,
        });
        console.log(`Created new restaurant document: ${restaurant.name}`);
      } else {
        console.log(`Restaurant document already exists: ${restaurant.name}`);
      }
    }

    console.log("Restaurant data initialization complete.");
  } catch (error) {
    console.error("Error initializing restaurant data:", error);
  }
};
*/
