import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Animated, 
  ActivityIndicator,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import axios from 'axios';
import { useNutritionistDetailContext } from '../context/NutritionistContext';
import { URL } from '../../constants/url';

// Constants - move API URL to a constant for easier management
const API_BASE_URL = URL; // Consider using environment variables

export default function ClientProfile() {
  const { clientId } = useLocalSearchParams();  // Get clientId from params
  const router = useRouter();
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const { nutritionistDetail, updateNutritionistDetail } = useNutritionistDetailContext({});
  const [clientData, setClientData] = useState({});  // Initialize as empty object instead of null
  
  // New state variables for editing functionality
  const [originalData, setOriginalData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Animation values - simplified
  const fadeAnim = useRef(new Animated.Value(1)).current; // Start visible
  
  useEffect(() => {
    const fetchClientProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${API_BASE_URL}/create/check-client-exist`, { id: clientId });
        if (response.data.clientExist) {
          const data = response.data.clientInfo || {};
          console.log(data);
          
          setClientData(data);
          setOriginalData(JSON.parse(JSON.stringify(data))); // Deep copy for comparison
          setProfileComplete(true);
        } else {
          setClientData({});
          setOriginalData({});
          setProfileComplete(false);
        }
      } catch (error) {
        console.error('Error fetching client profile:', error);
        setError('Failed to load client profile. Please try again.');
      } finally {
        setLoading(false);
        // Simple fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    };
    
    if (clientId) {
      fetchClientProfile();
    } else {
      setError('Client ID is missing');
      setLoading(false);
    }
  }, [clientId, fadeAnim]);

  // Check for changes when clientData is updated
  useEffect(() => {
    if (isEditing) {
      const isChanged = JSON.stringify(clientData) !== JSON.stringify(originalData);
      setHasChanges(isChanged);
    }
  }, [clientData, originalData, isEditing]);

  // Function to handle field changes - modified to avoid re-renders
  const handleChange = (field, value) => {
    setClientData(prev => {
      const newData = {...prev};
      
      // Handle nested fields
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        if (!newData[parent]) newData[parent] = {};
        newData[parent] = {...newData[parent], [child]: value};
      } else {
        // Handle simple fields
        newData[field] = value;
      }
      return newData;
    });
  };

  // Function to handle array field changes with less re-renders
  const handleArrayChange = (field, index, value) => {
    setClientData(prev => {
      const newData = {...prev};
      if (!newData[field]) newData[field] = [];
      const newArray = [...newData[field]];
      newArray[index] = value;
      newData[field] = newArray;
      return newData;
    });
  };

  // Function to toggle permission value
  const togglePermission = (key) => {
    setClientData(prev => {
      const newData = {...prev};
      if (!newData.permissions) newData.permissions = {};
      newData.permissions = {
        ...newData.permissions,
        [key]: !newData.permissions[key]
      };
      return newData;
    });
  };

  // Function to save changes
  const saveChanges = async () => {
    try {
      setLoading(true);
      // API call to update client data
      await axios.put(`${API_BASE_URL}/create/update-client-nutritional-profile`, { 
        profileId: clientId,
        ...clientData, // Fixed - removed the "updates" wrapper
      });
      
      // Update original data to match current data
      setOriginalData(JSON.parse(JSON.stringify(clientData)));
      setIsEditing(false);
      setHasChanges(false);
      
      // Show success message or notification here if needed
    } catch (error) {
      console.error('Error saving client profile:', error);
      // Show error message
    } finally {
      setLoading(false);
    }
  };

  // Function to cancel editing
  const cancelEditing = () => {
    setClientData(JSON.parse(JSON.stringify(originalData))); // Reset to original data
    setIsEditing(false);
    setHasChanges(false);
  };

  // Default placeholder image
  const DEFAULT_PROFILE_IMAGE = 'https://via.placeholder.com/150';
  
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF5733" />
        <Text style={styles.loadingText}>Loading client profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Editable text field component - modified to avoid re-renders
  const EditableField = ({ label, value, field, keyboardType = 'default' }) => {
    return (
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>{label}</Text>
        {isEditing ? (
          <TextInput
            style={styles.editableValue}
            value={String(value || '')}
            onChangeText={(text) => handleChange(field, text)}
            keyboardType={keyboardType}
            multiline={false}
            blurOnSubmit={false}
          />
        ) : (
          <Text style={styles.infoValue}>{value || 'N/A'}</Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {profileComplete ? (
          <View style={{flex: 1}}>
            {/* Edit/Save/Cancel buttons */}
            <View style={styles.actionButtonsContainer}>
              {isEditing ? (
                <>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.cancelButton]} 
                    onPress={cancelEditing}
                  >
                    <Text style={styles.actionButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.saveButton, !hasChanges && styles.disabledButton]} 
                    onPress={saveChanges}
                    disabled={!hasChanges}
                  >
                    <Text style={styles.actionButtonText}>Save</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]} 
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <ScrollView 
              contentContainerStyle={styles.contentContainerStyle}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Profile Image */}
              <View style={styles.profileImageContainer}>
                <Image 
                  source={{ uri: clientData.profileUrl || DEFAULT_PROFILE_IMAGE }} 
                  style={styles.profileImage}
                  onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
                />
                <View style={styles.nameContainer}>
                  {isEditing ? (
                    <TextInput
                      style={styles.editableClientName}
                      value={clientData.name || ''}
                      onChangeText={(text) => handleChange('name', text)}
                      blurOnSubmit={false}
                    />
                  ) : (
                    <Text style={styles.clientName}>{clientData.name || 'Client'}</Text>
                  )}
                </View>
              </View>

              {/* Basic Info */}
              <View style={styles.headingContainer}>
                <Text style={styles.heading}>Client Information</Text>
                <View style={styles.headingLine} />
              </View>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <EditableField 
                    label="Age" 
                    value={clientData.age} 
                    field="age" 
                    keyboardType="numeric" 
                  />
                  <EditableField 
                    label="Gender" 
                    value={clientData.gender} 
                    field="gender" 
                  />
                </View>
                <View style={styles.infoRow}>
                  <EditableField 
                    label="Weight (kg)" 
                    value={clientData.weight} 
                    field="weight" 
                    keyboardType="numeric" 
                  />
                  <EditableField 
                    label="Height (cm)" 
                    value={clientData.height} 
                    field="height" 
                    keyboardType="numeric" 
                  />
                </View>
                <View style={styles.infoRow}>
                  <EditableField 
                    label="Activity Level" 
                    value={clientData.activityLevel} 
                    field="activityLevel" 
                  />
                </View>
                <View style={styles.infoRow}>
                  <EditableField 
                    label="BMI" 
                    value={clientData.bmi} 
                    field="bmi" 
                    keyboardType="numeric" 
                  />
                  <EditableField 
                    label="BMR" 
                    value={clientData.bmr} 
                    field="bmr" 
                    keyboardType="numeric" 
                  />
                  <EditableField 
                    label="TDEE" 
                    value={clientData.tdee} 
                    field="tdee" 
                    keyboardType="numeric" 
                  />
                </View>
              </View>

              {/* Health Conditions */}
              <View style={styles.headingContainer}>
                <Text style={styles.heading}>Health Conditions</Text>
                <View style={styles.headingLine} />
              </View>
              <View style={styles.card}>
                {clientData.healthConditions && clientData.healthConditions.length > 0 ? (
                  clientData.healthConditions.map((condition, index) => (
                    <View key={index} style={styles.listItem}>
                      <Text style={styles.bulletPoint}>•</Text>
                      {isEditing ? (
                        <TextInput
                          style={styles.editableListItemText}
                          value={condition}
                          onChangeText={(text) => handleArrayChange('healthConditions', index, text)}
                          blurOnSubmit={false}
                        />
                      ) : (
                        <Text style={styles.listItemText}>{condition}</Text>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>None</Text>
                )}
              </View>

              {/* Goals */}
              <View style={styles.headingContainer}>
                <Text style={styles.heading}>Goals</Text>
                <View style={styles.headingLine} />
              </View>
              <View style={styles.card}>
                {clientData.goals && clientData.goals.length > 0 ? (
                  clientData.goals.map((goal, index) => (
                    <View key={index} style={styles.listItem}>
                      <Text style={styles.bulletPoint}>•</Text>
                      {isEditing ? (
                        <TextInput
                          style={styles.editableListItemText}
                          value={goal}
                          onChangeText={(text) => handleArrayChange('goals', index, text)}
                          blurOnSubmit={false}
                        />
                      ) : (
                        <Text style={styles.listItemText}>{goal}</Text>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No goals set</Text>
                )}
              </View>

              {/* Macros */}
              <View style={styles.headingContainer}>
                <Text style={styles.heading}>Macros</Text>
                <View style={styles.headingLine} />
              </View>
              <View style={styles.card}>
                {clientData.macros ? (
                  <View style={styles.macrosContainer}>
                    <View style={[styles.macroItem, { backgroundColor: '#FFE0E0' }]}>
                      {isEditing ? (
                        <TextInput
                          style={styles.editableMacroValue}
                          value={String(clientData.macros.carbs || '0')}
                          onChangeText={(text) => handleChange('macros.carbs', text)}
                          keyboardType="numeric"
                          blurOnSubmit={false}
                        />
                      ) : (
                        <Text style={styles.macroValue}>{clientData.macros.carbs || 0}g</Text>
                      )}
                      <Text style={styles.macroLabel}>Carbs</Text>
                    </View>
                    <View style={[styles.macroItem, { backgroundColor: '#E0F7FF' }]}>
                      {isEditing ? (
                        <TextInput
                          style={styles.editableMacroValue}
                          value={String(clientData.macros.fats || '0')}
                          onChangeText={(text) => handleChange('macros.fats', text)}
                          keyboardType="numeric"
                          blurOnSubmit={false}
                        />
                      ) : (
                        <Text style={styles.macroValue}>{clientData.macros.fats || 0}g</Text>
                      )}
                      <Text style={styles.macroLabel}>Fats</Text>
                    </View>
                    <View style={[styles.macroItem, { backgroundColor: '#E6FFE0' }]}>
                      {isEditing ? (
                        <TextInput
                          style={styles.editableMacroValue}
                          value={String(clientData.macros.protein || '0')}
                          onChangeText={(text) => handleChange('macros.protein', text)}
                          keyboardType="numeric"
                          blurOnSubmit={false}
                        />
                      ) : (
                        <Text style={styles.macroValue}>{clientData.macros.protein || 0}g</Text>
                      )}
                      <Text style={styles.macroLabel}>Protein</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No macros data available</Text>
                )}
              </View>

              {/* Permissions - now editable */}
              <View style={styles.headingContainer}>
                <Text style={styles.heading}>Permissions</Text>
                <View style={styles.headingLine} />
              </View>
              <View style={styles.card}>
                {clientData.permissions ? (
                  Object.entries(clientData.permissions).map(([key, value]) => (
                    <View key={key} style={styles.permissionItem}>
                      {isEditing ? (
                        <Switch
                          trackColor={{ false: "#f4f3f4", true: "#E6FFE0" }}
                          thumbColor={value ? "#4CAF50" : "#F44336"}
                          ios_backgroundColor="#f4f3f4"
                          onValueChange={() => togglePermission(key)}
                          value={Boolean(value)}
                          style={styles.permissionSwitch}
                        />
                      ) : (
                        <Text style={[styles.permissionIcon, { color: value ? "#4CAF50" : "#F44336" }]}>
                          {value ? "✓" : "✗"}
                        </Text>
                      )}
                      <Text style={styles.permissionText}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No permissions data available</Text>
                )}
              </View>
              
              <View style={styles.bottomSpace} />
            </ScrollView>
          </View>
        ) : (
          <View style={styles.warningContainer}>
            <Image 
              source={require('../../../assets/images/3582365.jpg')}
              style={styles.image} 
            />
            <Text style={styles.title}>Account Setup</Text>
            <Text style={styles.subtitle}>Before this client can continue using Eat This Much, their profile needs to be completed.</Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => navigation.navigate('(clientProfile)')}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Continue Account Setup</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  contentContainerStyle: {
    padding: 16,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FF5733',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  nameContainer: {
    marginTop: 10,
  },
  clientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  editableClientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#FF5733',
    padding: 4,
    minWidth: 150,
    textAlign: 'center',
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  headingLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  editableValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#FF5733',
    padding: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bulletPoint: {
    fontSize: 18,
    color: '#FF5733',
    marginRight: 8,
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  editableListItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#FF5733',
    padding: 2,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editableMacroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#FF5733',
    padding: 2,
    minWidth: 50,
    textAlign: 'center',
  },
  macroLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  permissionIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
    width: 24,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  permissionSwitch: {
    marginRight: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: '#FF5733',
    fontSize: 16,
    marginVertical: 15,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  warningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#FF5733',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: {
    width: 200,
    height: 150,
    marginBottom: 20,
    borderRadius: 12,
  },
  bottomSpace: {
    height: 40,
  },
  // New styles for edit functionality
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  editButton: {
    backgroundColor: '#4285F4',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
});