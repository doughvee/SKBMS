import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://hzoehlkvqxeqkiedipuk.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6b2VobGt2cXhlcWtpZWRpcHVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTk0NzkzOSwiZXhwIjoyMDU1NTIzOTM5fQ.zQYaDqgYqCMDLmwml_w9mDqkLm7zxXF41uvRLx2w1X4');

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('receipt_items')
        .select('username, budget_name')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error.message);
      } else {
        const formatted = data.map((item, index) => ({
          id: index,
          username: item.username,
          budget_name: item.budget_name,
        }));
        setNotifications(formatted);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('realtime-receipt-items')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'receipt_items' }, payload => {
        const newItem = payload.new;
        const newMessage = {
          id: Date.now(),
          username: newItem.username,
          budget_name: newItem.budget_name,
        };
        setNotifications(prev => [newMessage, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const goToBudgetDetails = (budgetName) => {
    navigation.navigate('BudgetDetails', { selectedBudget: budgetName });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Log Uploads</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        notifications.map(note => (
          <View key={note.id} style={styles.card}>
            <Text style={styles.message}>
              <Text style={styles.bold}>{note.username}</Text> added a receipt to{' '}
              <TouchableOpacity onPress={() => goToBudgetDetails(note.budget_name)}>
                <Text style={[styles.bold, styles.link]}>{note.budget_name}</Text>
              </TouchableOpacity>
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    padding: 14,
    backgroundColor: '#f0f4f7',
    borderRadius: 8,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
  },
  link: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});
