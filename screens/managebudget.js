import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView } from 'react-native';

export default function ManageBudget() {
  const [budgets, setBudgets] = useState([]);
  const [budgetName, setBudgetName] = useState('');
  const [error, setError] = useState('');

  // Add Budget
  const addBudget = () => {
    if (budgetName.trim() === '') {
      setError('Budget name cannot be empty');
      return;
    }
    setBudgets([...budgets, { id: Date.now().toString(), name: budgetName }]);
    setBudgetName('');
    setError('');
  };

  // Delete Budget
  const deleteBudget = (id) => {
    setBudgets(budgets.filter((item) => item.id !== id));
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Manage Budgets</Text>

      {/* Add Budget */}
      <TextInput
        placeholder="Enter Budget Name"
        value={budgetName}
        onChangeText={setBudgetName}
        style={{
          borderWidth: 1,
          borderColor: 'gray',
          padding: 10,
          marginBottom: 10,
          borderRadius: 5,
        }}
      />
      {error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}

      <TouchableOpacity
        onPress={addBudget}
        style={{
          backgroundColor: '#4CAF50',
          padding: 10,
          borderRadius: 5,
          marginBottom: 10,
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Add Budget</Text>
      </TouchableOpacity>

      {/* List of Budgets */}
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 10,
              backgroundColor: '#e0e0e0',
              marginTop: 10,
              borderRadius: 5,
            }}
          >
            <Text>{item.name}</Text>
            <TouchableOpacity
              onPress={() => deleteBudget(item.id)}
              style={{
                backgroundColor: '#FF4C4C',
                padding: 5,
                borderRadius: 5,
              }}
            >
              <Text style={{ color: 'white' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </ScrollView>
  );
}
