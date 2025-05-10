import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import * as Progress from 'react-native-progress';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hzoehlkvqxeqkiedipuk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6b2VobGt2cXhlcWtpZWRpcHVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTk0NzkzOSwiZXhwIjoyMDU1NTIzOTM5fQ.zQYaDqgYqCMDLmwml_w9mDqkLm7zxXF41uvRLx2w1X4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

    const totalSpent = savedBudgets.reduce((acc, curr) => acc + (parseFloat(curr.spent) || 0), 0);
    setTotalBudgetLeft(budgetForYear - totalSpent);
  }, []);

  const handleSaveYearlyBudget = () => {
    console.log("Saving yearly budget...", newYear, newAmount);

    const budgets = JSON.parse(localStorage.getItem('yearlyBudgets')) || {};
    budgets[newYear] = parseFloat(newAmount);
    localStorage.setItem('yearlyBudgets', JSON.stringify(budgets));

    setYearlyBudget(parseFloat(newAmount));
    setActiveYear(newYear);
    setShowBudgetForm(false);
    setNewAmount('');
  };

  const [plannedBudgetTotal, setPlannedBudgetTotal] = useState(0);
  const [spentBudgetTotal, setSpentBudgetTotal] = useState(0);
  

  useEffect(() => {
    supabase.rpc('get_budgets_with_spent')
      .then(({ data, error }) => {
        if (error) {
          console.log('Error fetching budget data:', error);
        } else {
          console.log('Budget data:', data);
          setBudgets(data);

          const spentTotal = data.reduce((acc, curr) => acc + (parseFloat(curr.spent) || 0), 0);
          const plannedTotal = data.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
          
          setTotalBudgetLeft(yearlyBudget - spentTotal);
          setBudgets(data);
          setPlannedBudgetTotal(plannedTotal);
          setSpentBudgetTotal(spentTotal);
          
        }
      });
  }, [yearlyBudget]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Dashboard</Text>

      <TouchableOpacity
        style={[styles.addBtn, { display: showBudgetForm ? 'none' : 'flex' }]}
        onPress={() => setShowBudgetForm(!showBudgetForm)}
      >
        <Text style={styles.addBtnText}>
          {showBudgetForm ? 'Cancel' : 'Add Annual Budget'}
        </Text>
      </TouchableOpacity>

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
          <Text style={styles.boxText}>Annual Budget ({activeYear})</Text>
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
    <View style={{ alignItems: 'center', marginTop: 20 }}>
      <Progress.Circle
        size={150}
        progress={yearlyBudget ? plannedBudgetTotal / yearlyBudget : 0}
        showsText={true}
        formatText={() =>
          `${Math.round((plannedBudgetTotal / yearlyBudget) * 100)}%`
        }
        color="#007bff"
        unfilledColor="#e0e0e0"
        borderWidth={0}
        thickness={10}
        textStyle={{ fontSize: 18, fontWeight: 'bold' }}
      />
      <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Planned Budget</Text>
      <Text style={{ color: '#007bff', fontWeight: 'bold', marginTop: 5 }}>
        ₱ {plannedBudgetTotal.toLocaleString()}
      </Text>
    </View>
  </View>

  <View style={styles.chartContainer}>
    <View style={{ alignItems: 'center', marginTop: 20 }}>
      <Progress.Circle
        size={150}
        progress={yearlyBudget ? spentBudgetTotal / yearlyBudget : 0}
        showsText={true}
        formatText={() =>
          `${Math.round((spentBudgetTotal / yearlyBudget) * 100)}%`
        }
        color="#ff5252"
        unfilledColor="#e0e0e0"
        borderWidth={0}
        thickness={10}
        textStyle={{ fontSize: 18, fontWeight: 'bold' }}
      />
      <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Spent Budget</Text>
      <Text style={{ color: '#ff5252', fontWeight: 'bold', marginTop: 5 }}>
        ₱ {spentBudgetTotal.toLocaleString()}
      </Text>
    </View>
  </View>



            <View style={styles.tableContainer}>
              <Text style={styles.tableTitle}>ABYIP</Text>

              <View style={styles.headerRow}>
                <Text style={[styles.budgetText, styles.headerText]}>PROGRAM / PROJECT / ACTIVITY</Text>
                <Text style={[styles.budgetText, styles.headerText]}>ALLOTED {'\n'} BUDGET</Text>
                <Text style={[styles.budgetText, styles.headerText]}>DISBURSED {'\n'} AMOUNT</Text>
              </View>

              {budgets.map((budget, index) => (
                <View
                  key={budget.id}
                  style={[
                    styles.budgetRow,
                    index % 2 === 0 ? styles.rowEven : styles.rowOdd,
                  ]}
                >
                  <Text style={styles.budgetText}>{budget.name}</Text>
                  <Text style={styles.budgetText}>₱ {Number(budget.amount).toLocaleString()}</Text>
                  <Text style={styles.budgetText}>₱ {Number(budget.spent || 0).toLocaleString()}</Text>
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
  heading: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },

  addBtn: {
    backgroundColor: '#6c63ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  addBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  budgetBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  box: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
  },
  boxYearly: { backgroundColor: '#007bff' },
  boxLeft: { backgroundColor: '#28a745' },
  boxText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  boxAmount: { color: 'white', fontSize: 18, marginTop: 6 },

  formContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  label: { fontWeight: 'bold', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
    fontSize: 14,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  saveBtn: {
    backgroundColor: '#28a745',
    padding: 10,
    flex: 1,
    marginRight: 5,
    borderRadius: 6,
  },
  cancelBtn: {
    backgroundColor: '#dc3545',
    padding: 10,
    flex: 1,
    marginLeft: 5,
    borderRadius: 6,
  },
  btnText: { color: 'white', textAlign: 'center' },

  chartTitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 10 },

  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  chartContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    elevation: 3,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    elevation: 3,
  },

  tableTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 5,
  },
  headerText: { color: 'white', fontWeight: 'bold' },

  budgetRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  budgetText: {
    flex: 1,
    fontSize: 13,
    textAlign: 'center',
  },
  rowEven: { backgroundColor: '#f9f9f9' },
  rowOdd: { backgroundColor: '#ffffff' },
});

export default Dashboard;
