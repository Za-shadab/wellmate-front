import axios from "axios";
import { URL } from "../../../../../constants/url";

const fetchNutritionData = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID not found");
    }

    const response = await axios.get(`${URL}/foodLog/progress/${userId}`);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      throw new Error(response.data.message || "Failed to fetch nutrition data");
    }
  } catch (error) {
    console.error("Error in fetchNutritionData:", error);
    return {
      success: false,
      error: error.message || "An error occurred while fetching nutrition data",
    };
  }
};

export default fetchNutritionData;
