import React, { useState, useEffect, useCallback  } from "react";
import { View, StyleSheet, Text  } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useLazyQuery, gql } from "@apollo/client";
import { useRouter } from "expo-router";

const SEARCH_QUERY = gql`
  query MyQuery($ingr: String, $upc: String) {
    search(ingr: $ingr, upc: $upc) {
      hints {
        food {
          label
          foodId
          image
          nutrients {
            ENERC_KCAL
            FAT
            FIBTG
            PROCNT
            CHOCDF
          }
          servingSizes {
            label
            quantity
          }
          servingsPerContainer
        }
        measures {
          label
          qualified {
            qualifiers {
              label
            }
            weight
          }
          weight
        }
      }
      text
    }
  }
`;

const BarcodeScannerScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannerEnabled, setScannerEnabled] = useState(false);
  const router = useRouter()
//   const { setScannerEnabled } = useScanner();
  const [searchFood] = useLazyQuery(SEARCH_QUERY);

  useEffect(() => {
    if (permission === null) {
      requestPermission();
    }
  }, [permission]);

  useFocusEffect(
    useCallback(() => {
      setScannerEnabled(true);
    }, [])
  );

  const handleBarCodeScanned = async ({ data }) => {
    console.log("Scanned UPC:", data);
    setScannerEnabled(false);

    try {
      const { data: searchData } = await searchFood({ variables: { upc: data } });

      if (searchData?.search?.hints?.length > 0) {
        const foodItem = searchData.search.hints[0];

        router.push({
          pathname: "(tabs)/FoodLog/BarCodeDetailScreen/[barcodeDetail]",
          params: { barcodeData: JSON.stringify(foodItem) },
        });
      } else {
        console.log("No food found for this UPC.");
      }
    } catch (error) {
      console.error("Error fetching food details:", error);
    }
  };

  if(scannerEnabled){
  return (
    <View style={{ flex: 1 }}>
      <CameraView style={{ flex: 1 }} onBarcodeScanned={handleBarCodeScanned} />
      <Ionicons
        onPress={() => {
            setScannerEnabled(false)
            router.back()
        }}
        name="close"
        size={30}
        color="dimgray"
        style={styles.closeButton}
      />
    </View>
  );
}
};

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    right: 10,
    top: 10,
  },
});

export default BarcodeScannerScreen;
