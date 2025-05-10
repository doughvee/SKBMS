import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, TouchableOpacity, Picker, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import supabase from '../supabaseClient';
import { useNavigation } from '@react-navigation/native';
import { PDFDocument, PDFPage } from 'react-native-pdf-lib';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';



const BudgetPlan = () => {
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ name: '', center: '', amount: '' });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [isConfirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState(false);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [errors, setErrors] = useState({ name: false, center: false, amount: false });
  const [deleteId, setDeleteId] = useState(null);
  const scrollViewRef = useRef();
  const navigation = useNavigation();

  const centers = ['Education', 'Environment', 'Health', 'Economic Empowerment', 'Active citizenship and governance'];

  const fetchBudgets = async () => {
    const { data, error } = await supabase.from('budget_plans').select('*');
    if (error) {
      console.error('Error fetching budgets:', error.message);
    } else {
      setBudgets(data);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
    if (budgets.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [budgets]);

  const handleChange = (name, value) => {
    if (name === 'amount') {
      value = value.replace(/[^0-9.]/g, '');
      if (value.includes('.') && value.split('.').length > 2) return;
      const [integerPart, decimalPart] = value.split('.');
      let formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      let formattedValue = decimalPart !== undefined
        ? `${formattedInteger}.${decimalPart.slice(0, 2)}`
        : formattedInteger;
      setForm({ ...form, [name]: formattedValue });
    } else {
      setForm({ ...form, [name]: value });
    }
    setErrors({ ...errors, [name]: false });
  };

  const handleSubmit = async () => {
    let newErrors = {
      name: !form.name.trim(),
      center: !form.center,
      amount: !form.amount.trim(),
    };
    setErrors(newErrors);
  
    if (newErrors.name || newErrors.center || newErrors.amount) {
      setModalMessage('Please fill in all required fields before proceeding.');
      setErrorModalVisible(true);
      return;
    }
  
    const newBudget = {
      name: form.name,
      center: form.center,
      amount: parseFloat(form.amount.replace(/,/g, '')),
      date_created: new Date().toISOString(),
    };
  
    try {
      if (editId !== null) {
        const { error } = await supabase
          .from('budget_plans')
          .update(newBudget)
          .eq('id', editId);
  
        if (error) throw error;
  
        setBudgets(budgets.map((b) => (b.id === editId ? { ...b, ...newBudget } : b)));
        setEditId(null);
        setCreateModalVisible(false); 
      } else {
        const { data, error } = await supabase
          .from('budget_plans')
          .insert([newBudget])
          .select();
  
        if (error) throw error;
  
        setBudgets([...budgets, ...data]);
        setModalMessage('Budget plan successfully added!');
        setErrorModalVisible(true);
      }
    } catch (error) {
      console.error('Error saving budget:', error.message);
      setModalMessage('An error occurred while saving the budget.');
      setErrorModalVisible(true);
    }
  
    setForm({ name: '', center: '', amount: '' });
    setShowForm(false);
  };
  
  const openEditModal = (budget) => {
    setForm({
      name: budget.name,
      center: budget.center,
      amount: budget.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    });
    setEditId(budget.id);
    setCreateModalVisible(true);
  };
  
  const openCreateModal = () => {
    setForm({ name: '', center: '', amount: '' });
    setEditId(null);  
    setCreateModalVisible(true);
  };
  
  const handleDownload = async (budget) => {
    try {
      const { data: receipts, error } = await supabase
        .from('receipt_items')
        .select('*')
        .eq('budget_name', budget.name);
  
      if (error) throw error;
  
      const formatPeso = (amount) =>
        `₱${Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  
      // Create the PDF page content
      const lines = [
        `Budget Plan Details`,
        `Name: ${budget.name}`,
        `Center: ${budget.center}`,
        `Total: ${formatPeso(budget.amount)}`,
        `Created: ${new Date(budget.date_created).toLocaleString()}`,
        '',
        `Receipt Items:`,
      ];
  
      receipts.forEach((item, i) => {
        lines.push(
          `${i + 1}. ${item.item_name} | Qty: ${item.quantity} | Unit: ${formatPeso(item.unit_price)} | Total: ${formatPeso(item.total_amount)}`
        );
      });
  
      const page1 = PDFPage
        .create()
        .setMediaBox(600, 800);
  
      lines.forEach((line, idx) => {
        page1.drawText(line, {
          x: 20,
          y: 780 - idx * 20,
          color: '#000000',
          fontSize: 12,
        });
      });
  
      const docsDir = FileSystem.documentDirectory;
      const pdfPath = `${docsDir}budget_plan_${budget.name.replace(/\s+/g, '_')}.pdf`;
  
      const pdf = await PDFDocument
        .create(pdfPath)
        .addPages(page1)
        .write(); // Returns a promise that resolves with the PDF's path
  
      await Sharing.shareAsync(pdfPath);
    } catch (err) {
      console.error('PDF Download Error:', err);
      setModalMessage('An error occurred while generating the PDF.');
      setErrorModalVisible(true);
    }
  };
  
  
  const confirmDelete = (id) => {
    setDeleteId(id);
    setModalMessage('Are you sure you want to delete this budget?');
    setConfirmDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('budget_plans')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      const updatedBudgets = budgets.filter(budget => budget.id !== deleteId);
      setBudgets(updatedBudgets);

      setDeleteId(null);
      setConfirmDeleteModalVisible(false);
      setModalMessage('Budget successfully deleted.');
      setErrorModalVisible(true);
    } catch (error) {
      console.error('Error deleting budget:', error.message);
      setModalMessage('An error occurred while deleting the budget.');
      setErrorModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
<View style={styles.header}>
  <Text style={styles.title}>ANNUAL BARANGAY YOUTH INVESTMENT PROGRAM</Text>
  <TouchableOpacity onPress={openCreateModal} style={styles.createButton}>
  <Text style={styles.createButtonText}>Create</Text>
</TouchableOpacity>

</View>


      {/* Create Modal */}
      <Modal transparent={true} animationType="slide" visible={isCreateModalVisible} onRequestClose={() => setCreateModalVisible(false)}>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>{editId ? 'Edit Budget Plan' : 'Create'}</Text>
      <TextInput
        style={[styles.input, errors.name && styles.errorBorder]}
        placeholder="PROGRAM / PROJECT / ACTIVITY"
        value={form.name}
        onChangeText={(text) => handleChange('name', text)}
      />
      <Picker
        selectedValue={form.center}
        style={[styles.input, errors.center && styles.errorBorder]}
        onValueChange={(itemValue) => handleChange('center', itemValue)}
      >
        <Picker.Item label="SELECT CENTER OF PARTICIPATION" value="" />
        {centers.map((center, index) => (
          <Picker.Item key={index} label={center} value={center} />
        ))}
      </Picker>
      <TextInput
        style={[styles.input, errors.amount && styles.errorBorder]}
        placeholder="AMOUNT"
        keyboardType="numeric"
        value={form.amount}
        onChangeText={(text) => handleChange('amount', text)}
      />
      <View style={styles.buttonContainer}>
        <Button title={editId ? 'Update Budget' : 'Create'} onPress={handleSubmit} />
        <View style={{ width: 20 }} />
        <Button title="Cancel" onPress={() => setCreateModalVisible(false)} color="red" />
      </View>
    </View>
  </View>
</Modal>


      {/* Header Row */}
      {budgets.length > 0 && (
        <View style={styles.identifierRow}>
          <Text style={[styles.identifierText, styles.identifierPlans]}>PROGRAM / PROJECT / ACTIVITY</Text>
          <Text style={[styles.identifierText, styles.identifierDate]}>DATE</Text>
          <Text style={[styles.identifierText, styles.identifierCOP]}>COP</Text>
        </View>
      )}

      {/* Budget List */}
      <ScrollView style={styles.list} ref={scrollViewRef}>
        {budgets.map((budget) => (
          <View key={budget.id} style={styles.budgetItem}>
            <Text style={[styles.budgetText, styles.budgetPlans]}>{budget.name}</Text>
            <Text style={[styles.budgetText, styles.budgetDate]}>
              {budget.date_created ? new Date(budget.date_created).toLocaleString() : 'No Date'}
            </Text>
            <Text style={[styles.budgetText, styles.budgetCOP]}>{budget.center}</Text>

            <View style={styles.actions}>
            <TouchableOpacity
  onPress={() => openEditModal(budget)}
  style={[styles.editButton, { marginRight: 5 }]} 
>
  <Icon name="edit" size={20} color="#fff" />
</TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate("BudgetDetails", {
                  selectedBudget: budget.name
                })}
                style={styles.viewButton}
              >
                <Icon name="visibility" size={20} color="#fff" />
              </TouchableOpacity>

            <TouchableOpacity onPress={() => handleDownload(budget)} style={styles.downloadButton}>
                <Icon name="file-download" size={20} color="#fff" />
            </TouchableOpacity>

              <TouchableOpacity onPress={() => confirmDelete(budget.id)} style={styles.deleteButton}>
                <Icon name="delete" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Error Modal */}
      <Modal transparent={true} animationType="fade" visible={isErrorModalVisible} onRequestClose={() => setErrorModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚠️ Attention</Text>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setErrorModalVisible(false)}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Modal */}
      <Modal transparent={true} animationType="fade" visible={isConfirmDeleteModalVisible} onRequestClose={() => setConfirmDeleteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚠️ Confirmation</Text>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#d9534f', marginRight: 10 }]} onPress={handleDelete}>
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#6c757d' }]} onPress={() => setConfirmDeleteModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  input: {
    width: '70%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  errorBorder: { borderColor: 'red', borderWidth: 2 },
  list: { marginTop: 20, maxHeight: 400 },
  budgetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderRadius: 5,
  },
  budgetText: { fontSize: 14, paddingVertical: 5 },
  actions: { flexDirection: 'row' },
  viewButton: { backgroundColor: '#2196F3', padding: 8, borderRadius: 5, marginRight: 5 },
  downloadButton: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 5 },
  deleteButton: { backgroundColor: '#d9534f', padding: 8, borderRadius: 5, marginLeft: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalText: { fontSize: 16, textAlign: 'center', marginBottom: 15 },
  modalButton: { backgroundColor: '#007bff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
  modalButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },

  identifierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  identifierText: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  identifierPlans: { flex: 2, textAlign: 'left' },
  identifierDate: { flex: 1.5, textAlign: 'left' },
  identifierCOP: { flex: 1.5, textAlign: 'left' },
  budgetPlans: { flex: 2, textAlign: 'left' },
  budgetDate: { flex: 1.5, textAlign: 'left' },
  budgetCOP: { flex: 1.5, textAlign: 'left' },

  editButton: {
    backgroundColor: '#FFA500',
    padding: 8,
    borderRadius: 5,
    marginRight: 5, 
  },
   
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  
  createButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
});

export default BudgetPlan;