import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Modal,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import supabase from "../supabaseClient";

const Users = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [position, setPosition] = useState("");
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [errorFields, setErrorFields] = useState({ username: false, password: false, position: false });
  const [modalMessage, setModalMessage] = useState("");
  const [isConfirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const positions = ["SK Chairman", "SK Kagawad", "SK Secretary", "SK Treasurer"];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("id", { ascending: true });

    if (!error) setUsers(data);
  };

  const handleSaveUser = async () => {
    const errors = {
      username: !username.trim(),
      password: password.length < 8,
      position: !position,
    };
    setErrorFields(errors);
    if (errors.username || errors.password || errors.position) {
      Alert.alert("Error", "Password must be at least 8 characters long.");
      return;
    }
    try {
      if (editMode) {
        const { error } = await supabase
          .from("users")
          .update({ username, password, position })
          .eq("id", currentUserId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("users").insert([{ username, password, position }]);
        if (error) throw error;
      }
      await fetchUsers();
      resetFields();
      setModalVisible(false);
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleEditUser = (user) => {
    setUsername(user.username);
    setPassword(user.password);
    setPosition(user.position);
    setCurrentUserId(user.id);
    setEditMode(true);
    setModalVisible(true);
  };

  const handleConfirmDelete = (userId) => {
    setModalMessage("Are you sure you want to delete this user?");
    setUserToDelete(userId);
    setConfirmDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      const { error } = await supabase.from("users").delete().eq("id", userToDelete);
      if (!error) {
        setUsers((prev) => prev.filter((user) => user.id !== userToDelete));
        await fetchUsers();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setConfirmDeleteModalVisible(false);
      setUserToDelete(null);
    }
  };

  const resetFields = () => {
    setUsername("");
    setPassword("");
    setPosition("");
    setEditMode(false);
    setErrorFields({ username: false, password: false, position: false });
    setShowPassword(false);
  };

  const handleCancel = () => {
    resetFields();
    setModalVisible(false); // Close modal without saving
  };

  return (
    <View style={styles.container}>
      {/* Keep 'Add User' button always visible */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.createButton}>
          <Text style={styles.createButtonText}>Add User</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Users List</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.userText}>{item.username} - {item.position}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => handleEditUser(item)} style={styles.editButton}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleConfirmDelete(item.id)} style={styles.deleteButton}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Create/Edit User Modal */}
      <Modal transparent={true} animationType="fade" visible={modalVisible} onRequestClose={handleCancel}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editMode ? " Edit User" : " Add User"}</Text>

            <TextInput
              style={[styles.input, errorFields.username && styles.errorBorder]}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />

            <View style={[styles.passwordContainer, errorFields.password && styles.errorBorder]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Icon name={showPassword ? "eye-off" : "eye"} size={24} color="#888" />
              </TouchableOpacity>
            </View>

            <View style={[styles.pickerContainer, errorFields.position && styles.errorBorder]}>
              <Picker selectedValue={position} onValueChange={setPosition}>
                <Picker.Item label="Select Position" value="" />
                {positions.map((pos) => (
                  <Picker.Item key={pos} label={pos} value={pos} />
                ))}
              </Picker>
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#28a745", marginRight: 10 }]} onPress={handleSaveUser}>
                <Text style={styles.modalButtonText}>{editMode ? "Update" : "Save"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#6c757d" }]} onPress={handleCancel}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal transparent={true} animationType="fade" visible={isConfirmDeleteModalVisible} onRequestClose={() => setConfirmDeleteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚠️ Confirmation</Text>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <View style={styles.modalButtonContainer}>
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
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  subtitle: { fontSize: 18, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 5, backgroundColor: "#fff" },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 10,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
  },
  eyeIcon: {
    padding: 5,
  },
  pickerContainer: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, backgroundColor: "#fff", marginBottom: 10 },
  buttonContainer: { flexDirection: "row" },
  editButton: { backgroundColor: "#4CAF50", padding: 8, borderRadius: 5, marginRight: 5 },
  deleteButton: { backgroundColor: "#ff4d4d", padding: 8, borderRadius: 5 },
  buttonText: { color: "#fff", fontWeight: "bold", paddingHorizontal: 10 },
  errorBorder: { borderColor: "red" },
  header: { flexDirection: "row", justifyContent: "flex-end", paddingBottom: 15 },
  createButton: { backgroundColor: "#2196F3", paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5 },
  createButtonText: { color: "white", fontSize: 14, fontWeight: "bold" },
  userItem: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#f1f1f1", padding: 15, borderRadius: 5, marginBottom: 5 },
  userText: { fontSize: 16 },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  modalText: { fontSize: 16, textAlign: "center" },
  modalButtonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',  // Center the buttons horizontally
    marginTop: 10,             // Optional: gives some space above the buttons
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    minWidth: 120,       // Minimum width for better fit
    marginHorizontal: 5, // Space between buttons
  },
});

export default Users;
