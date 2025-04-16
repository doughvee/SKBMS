import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const Dashboard = () => {
  const [budgets, setBudgets] = useState([]);
  const [yearlyBudget, setYearlyBudget] = useState(0);
  const [totalBudgetLeft, setTotalBudgetLeft] = useState(0);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());
  const [newAmount, setNewAmount] = useState('');
  const [activeYear, setActiveYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    const savedBudgets = JSON.parse(localStorage.getItem('budgets')) || [];
    const savedYearlyBudgets = JSON.parse(localStorage.getItem('yearlyBudgets')) || {};
    const currentYear = new Date().getFullYear().toString();
    const budgetForYear = parseFloat(savedYearlyBudgets[currentYear]) || 0;

    setBudgets(savedBudgets);
    setYearlyBudget(budgetForYear);
    setActiveYear(currentYear);

    const totalSpent = savedBudgets.reduce(
      (acc, curr) => acc + (parseFloat(curr.amount) || 0), 0
    );

    setTotalBudgetLeft(budgetForYear - totalSpent);
  }, []);

  const handleSaveYearlyBudget = () => {
    const savedYearlyBudgets = JSON.parse(localStorage.getItem('yearlyBudgets')) || {};
    savedYearlyBudgets[newYear] = parseFloat(newAmount) || 0;
    localStorage.setItem('yearlyBudgets', JSON.stringify(savedYearlyBudgets));

    setYearlyBudget(parseFloat(newAmount));
    setActiveYear(newYear);

    const totalSpent = budgets.reduce(
      (acc, curr) => acc + (parseFloat(curr.amount) || 0), 0
    );

    setTotalBudgetLeft((parseFloat(newAmount) || 0) - totalSpent);
    setShowBudgetForm(false);
    setNewYear(new Date().getFullYear().toString());
    setNewAmount('');
  };

  const chartData = [
    { label: 'Spent', value: yearlyBudget - totalBudgetLeft, color: '#ff6384' },
    { label: 'Remaining', value: totalBudgetLeft, color: '#36a2eb' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Dashboard</Text>
  
      <View style={styles.addBtnContainer}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowBudgetForm(!showBudgetForm)}
        >
          <Text style={styles.addBtnText}>
            {showBudgetForm ? 'Cancel' : 'Add Yearly Budget'}
          </Text>
        </TouchableOpacity>
      </View>
  
      {showBudgetForm && (
        <View style={styles.formContainer}>
          <Text style={styles.label}>Year</Text>
          <TextInput
            style={styles.input}
            value={newYear}
            onChangeText={setNewYear}
            placeholder="e.g. 2025"
            keyboardType="numeric"
          />
          <Text style={styles.label}>Budget Amount</Text>
          <TextInput
            style={styles.input}
            value={newAmount}
            onChangeText={setNewAmount}
            placeholder="e.g. 100000"
            keyboardType="numeric"
          />
  
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveYearlyBudget}>
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowBudgetForm(false)}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
  
      <View style={styles.budgetBoxContainer}>
        <View style={[styles.box, styles.boxYearly]}>
          <Text style={styles.boxText}>Yearly Budget ({activeYear})</Text>
          <Text style={styles.boxAmount}>₱ {yearlyBudget.toLocaleString()}</Text>
        </View>
        <View style={[styles.box, styles.boxLeft]}>
          <Text style={styles.boxText}>Total Budget Left</Text>
          <Text style={styles.boxAmount}>₱ {totalBudgetLeft.toLocaleString()}</Text>
        </View>
      </View>
  
      {yearlyBudget > 0 && (
  <>
    <Text style={styles.chartTitle}>Budget Summary</Text>
    <View style={styles.rowContainer}>
      <View style={styles.chartContainer}>
        <PieChart
          data={[
            {
              name: 'Remaining',
              population: totalBudgetLeft > 0 ? totalBudgetLeft : 0.01,
              color: '#28a745',
              legendFontColor: '#000',
              legendFontSize: 14,
            },
            {
              name: 'Spent',
              population: Math.max(yearlyBudget - totalBudgetLeft, 0.01),
              color: '#ff5252',
              legendFontColor: '#000',
              legendFontSize: 14,
            },
          ]}
          width={screenWidth * 0.45}
          height={250}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          absolute
        />

      </View>

      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>Budget Plans</Text>

        <View style={styles.headerRow}>
          <Text style={styles.budgetText}>Name</Text>
          <Text style={styles.budgetText}>Date</Text>
          <Text style={styles.budgetText}>Center</Text>
          <Text style={styles.budgetText}>Amount</Text>
        </View>

        {budgets.map((budget) => (
          <View key={budget.id} style={styles.budgetRow}>
            <Text style={styles.budgetText}>{budget.name}</Text>
            <Text style={styles.budgetText}>
              {budget.date_created
                ? new Date(budget.date_created).toLocaleDateString()
                : 'No Date'}
            </Text>
            <Text style={styles.budgetText}>{budget.center}</Text>
            <Text style={styles.budgetText}>₱ {Number(budget.amount).toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </View>
  </>
)}
    </ScrollView>
  );
  
  
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },

  addBtnContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  addBtn: {
    backgroundColor: '#6c63ff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  addBtnText: { color: 'white', fontWeight: 'bold' },

  budgetBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  box: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    minWidth: 0,
  },
  boxYearly: { backgroundColor: '#007bff' },
  boxLeft: { backgroundColor: '#28a745' },
  boxText: { color: 'white', fontWeight: 'bold' },
  boxAmount: { color: 'white', fontSize: 18 },

  formContainer: { backgroundColor: '#f4f4f4', padding: 15, borderRadius: 10, marginBottom: 20 },
  label: { fontWeight: 'bold', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginTop: 5 },
  formActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  saveBtn: { backgroundColor: '#28a745', padding: 10, flex: 1, marginRight: 5, borderRadius: 6 },
  cancelBtn: { backgroundColor: '#dc3545', padding: 10, flex: 1, marginLeft: 5, borderRadius: 6 },
  btnText: { color: 'white', textAlign: 'center' },

  chartTitle: { fontWeight: 'bold', marginTop: 10 },

  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 10,
  },
  chartContainer: {
    flex: 1,
    borderRadius: 12,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#ffff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  tableTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#007bff',
    backgroundColor: '#007bff',
    paddingVertical: 8,
  },
  headerText: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  budgetText: {
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
});

export default Dashboard;
