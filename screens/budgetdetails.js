import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const supabase = createClient(
  "https://hzoehlkvqxeqkiedipuk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6b2VobGt2cXhlcWtpZWRpcHVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTk0NzkzOSwiZXhwIjoyMDU1NTIzOTM5fQ.zQYaDqgYqCMDLmwml_w9mDqkLm7zxXF41uvRLx2w1X4" 
);

const BudgetDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [budgetPlans, setBudgetPlans] = useState([]);
  const [selectedBudgetName, setSelectedBudgetName] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalBudget, setTotalBudget] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [error, setError] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const { data: budgetData, error: budgetError } = await supabase
          .from("budget_plans")
          .select("*");

        if (budgetError) throw budgetError;

        setBudgetPlans(budgetData);

        const initialSelected =
          route.params?.selectedBudget || budgetData[0]?.name;
        setSelectedBudgetName(initialSelected || "");

        if (initialSelected) {
          await fetchReceiptItems(initialSelected, budgetData);
        }
      } catch (error) {
        console.error("Error fetching budget plans:", error.message);
        setError("Error loading budget plans. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [route.params?.selectedBudget]);

  const fetchReceiptItems = async (budgetName, plans = budgetPlans) => {
    try {
      setLoading(true);
      const { data: receiptData, error: receiptError } = await supabase
        .from("receipt_items")
        .select("*")
        .eq("budget_name", budgetName);

      if (receiptError) throw receiptError;

      setData(receiptData);

      const selectedPlan = plans.find(
        (plan) => plan.name.toLowerCase() === budgetName.toLowerCase()
      );

      const totalBudgetAmount = selectedPlan?.amount || 0;
      const totalSpent = receiptData.reduce(
        (acc, item) => acc + Number(item.total_amount || 0),
        0
      );
      setTotalBudget(totalBudgetAmount);
      setRemaining(totalBudgetAmount - totalSpent);

      // Save the spent amount in localStorage (or globally)
      const savedBudgets = JSON.parse(localStorage.getItem('budgets')) || [];
      const updatedBudgets = savedBudgets.map((budget) =>
        budget.name === budgetName ? { ...budget, spent: totalSpent } : budget
      );
      localStorage.setItem('budgets', JSON.stringify(updatedBudgets));

    } catch (error) {
      console.error("Error fetching receipt items:", error.message);
      setError("Error loading receipt data. Please try again.");
    } finally {
      setLoading(false);
    }
};

  const handleBudgetSelect = async (budgetName) => {
    setSelectedBudgetName(budgetName);
    setDropdownVisible(false);
    await fetchReceiptItems(budgetName);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() =>
          navigation.canGoBack()
            ? navigation.goBack()
            : navigation.navigate("Dashboard")
        }
      >
        <Text style={styles.backButtonText}>⬅</Text>
      </TouchableOpacity>

      {/* Dropdown */}
      <View style={{ position: "relative", zIndex: 5 }}>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Text style={styles.selectedBudgetText}>
            {selectedBudgetName || "Select Budget Plan"}
          </Text>
        </TouchableOpacity>

        {dropdownVisible && (
          <View style={styles.dropdownMenu}>
            <ScrollView>
              {budgetPlans.length > 0 ? (
                budgetPlans.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.dropdownItem,
                      selectedBudgetName === item.name && styles.selectedItem,
                    ]}
                    onPress={() => handleBudgetSelect(item.name)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedBudgetName === item.name &&
                          styles.selectedItemText,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noDataText}>No budget plans available.</Text>
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <ScrollView horizontal>
            <View style={styles.table}>
              <View style={styles.tableRowHeader}>
                <Text style={styles.tableHeaderCell}>Item Name</Text>
                <Text style={styles.tableHeaderCell}>Quantity</Text>
                <Text style={styles.tableHeaderCell}>Unit Price</Text>
                <Text style={styles.tableHeaderCell}>Total Amount</Text>
                <Text style={styles.tableHeaderCell}>Receipt Image</Text>
              </View>

              <ScrollView style={{ maxHeight: 400 }}>
                {data.length === 0 ? (
                  <Text style={styles.noDataText}>No data available.</Text>
                ) : (
                  data.map((item, index) => (
                    <View
                      key={index}
                      style={[
                        styles.tableRow,
                        {
                          backgroundColor: index % 2 === 0 ? "#fff" : "#f2f2f2",
                        },
                      ]}
                    >
                      <Text style={styles.tableCell}>{item.item_name}</Text>
                      <Text style={styles.tableCell}>{item.quantity}</Text>
                      <Text style={styles.tableCell}>₱{item.unit_price}</Text>
                      <Text style={styles.tableCell}>₱{item.total_amount}</Text>
                      <View style={styles.imageContainer}>
                        {item.image_url ? (
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedImageUrl(item.image_url);
                              setModalVisible(true);
                            }}
                          >
                            <Image
                              source={{ uri: item.image_url }}
                              style={styles.image}
                            />
                          </TouchableOpacity>
                        ) : (
                          <Text>No Image</Text>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </ScrollView>

          {/* Budget Summary Below Table */}
          {selectedBudgetName && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>
                Budget Amount: ₱
                {totalBudget.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </Text>
              <Text style={styles.summaryText}>
                Spent: ₱
                {(totalBudget - remaining).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </Text>
              <Text
                style={[
                  styles.summaryText,
                  remaining < 0 && { color: "red" },
                ]}
              >
                Remaining Budget: ₱
                {remaining.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
          )}
        </>
      )}

      {/* Image Modal */}
      {selectedImageUrl && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setModalVisible(false)}
          >
            <Image
              source={{ uri: selectedImageUrl }}
              style={styles.fullImage}
            />
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 10,
    backgroundColor: "#f4f4f4",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingVertical: 5,
    paddingHorizontal: 25,
    backgroundColor: "#007bff",
    borderRadius: 50,
    zIndex: 10,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdown: {
    backgroundColor: "#d3d3d3",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 30,
    marginVertical: 10,
    alignItems: "center",
    alignSelf: "center",
    width: 700,
    elevation: 4,
  },
  selectedBudgetText: {
    fontSize: 20,
    color: "#333",
    fontWeight: "bold",
    textAlign: "center",
  },
  dropdownMenu: {
    backgroundColor: "#fff",
    borderRadius: 10,
    position: "absolute",
    top: 65,
    alignSelf: "center",
    width: 700,
    maxHeight: 250,
    zIndex: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  dropdownItem: {
    paddingVertical: 16,
    paddingHorizontal: 25,
  },
  dropdownItemText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "600",
  },
  selectedItem: {
    backgroundColor: "#cce5ff",
  },
  selectedItemText: {
    color: "#007bff",
    fontWeight: "bold",
  },
  loading: {
    marginTop: 20,
  },
  errorText: {
    textAlign: "center",
    color: "red",
    fontSize: 16,
    marginTop: 20,
  },
  table: {
    minWidth: screenWidth,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    overflow: "hidden",
  },
  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#007bff",
    paddingVertical: 12,
  },
  tableHeaderCell: {
    flex: 1,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 10,
    fontSize: 20,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
    paddingHorizontal: 10,
    fontSize: 17,
  },
  noDataText: {
    padding: 20,
    textAlign: "center",
    color: "#888",
    fontSize: 25,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  summaryText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: "70%",
    resizeMode: "contain",
  },
});

export default BudgetDetails;
