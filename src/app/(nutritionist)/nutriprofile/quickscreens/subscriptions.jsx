import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  SafeAreaView,
  Animated,
  Dimensions,
  Platform,
  RefreshControl,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { URL } from '../../../../constants/url';
import { useNutritionistDetailContext} from '../../../context/NutritionistContext';

const { width } = Dimensions.get('window');

const API_URL = URL;

const SubscriptionManagementScreen = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [pauseCycles, setPauseCycles] = useState('1');
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); // 'cancel', 'pause', or 'details'
  const [actionLoading, setActionLoading] = useState(false);

  const { nutritionistDetail } = useNutritionistDetailContext();
  const userId = nutritionistDetail?.userId;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, fadeAnim, slideAnim]);

  const fetchSubscriptions = async () => {
    if (!userId) return;

    try {
      setError(null);
      setLoading(true);
      
      // First get all user subscriptions
      const subsResponse = await axios.get(`${URL}/create-subscription/user-subscriptions/${userId}`);
      
      if (subsResponse.data && subsResponse.data.subscriptions) {
        // Get detailed info for each subscription
        const detailedSubscriptions = await Promise.all(
          subsResponse.data.subscriptions.map(async (sub) => {
            try {
              // Get subscription details
              const detailResponse = await axios.get(
                `${URL}/create-subscription/subscription-details/${sub.subscriptionId}`
              );

              // Get plan details
              const planResponse = await axios.get(
                `${URL}/create-subscription/plan-details/${sub.planId}`
              );

              return {
                ...sub,
                ...detailResponse.data.subscription,
                plan: planResponse.data.plan,
                id: sub._id || sub.subscriptionId,
                planName: planResponse.data.plan.planName,
                amount: planResponse.data.plan.amount,
                features: planResponse.data.plan.features,
                maxClients: planResponse.data.plan.maxClients
              };
            } catch (error) {
              console.error(`Error fetching details for subscription ${sub.subscriptionId}:`, error);
              return {
                ...sub,
                id: sub._id || sub.subscriptionId,
                nextBillingDate: new Date(sub.createdAt).getTime() + (30 * 24 * 60 * 60 * 1000),
                razorpayStatus: sub.status,
                planName: 'Nutrition Plan',
                amount: 99900,
                billingCycle: 'Monthly'
              };
            }
          })
        );

        setSubscriptions(detailedSubscriptions);
      } else {
        setSubscriptions([]);
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError('Failed to load your subscriptions. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubscriptions();
  };

  const handleCancelSubscription = async () => {
    if (!selectedSubscription || !userId) return;

    try {
      setActionLoading(true);
      
      const response = await axios.post(
        `${API_URL}/create-subscription/cancel-subscription/${selectedSubscription.subscriptionId}`,
        {
          userId,
          cancelAtPeriodEnd,
        }
      );
      
      if (response.data && response.data.success) {
        // Update the local state
        setSubscriptions(prevSubscriptions => 
          prevSubscriptions.map(sub => 
            sub.subscriptionId === selectedSubscription.subscriptionId
              ? { ...sub, status: cancelAtPeriodEnd ? 'scheduled_for_cancellation' : 'cancelled' }
              : sub
          )
        );
        
        Alert.alert(
          'Success',
          cancelAtPeriodEnd 
            ? 'Your subscription will be cancelled at the end of the current billing period.'
            : 'Your subscription has been cancelled successfully.'
        );
      }
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      Alert.alert(
        'Error',
        err.response?.data?.error || 'Failed to cancel subscription. Please try again.'
      );
    } finally {
      setActionLoading(false);
      setModalVisible(false);
      setCancelAtPeriodEnd(false);
    }
  };

  const handlePauseSubscription = async () => {
    if (!selectedSubscription || !userId) return;

    try {
      setActionLoading(true);
      
      const response = await axios.post(
        `${API_URL}/create-subscription/pause-subscription/${selectedSubscription.subscriptionId}`,
        {
          userId,
          pauseCycles: parseInt(pauseCycles, 10) || 1,
        }
      );
      
      if (response.data && response.data.success) {
        // Update the local state
        setSubscriptions(prevSubscriptions => 
          prevSubscriptions.map(sub => 
            sub.subscriptionId === selectedSubscription.subscriptionId
              ? { ...sub, status: 'paused' }
              : sub
          )
        );
        
        Alert.alert(
          'Success',
          `Your subscription has been paused for ${pauseCycles} ${parseInt(pauseCycles, 10) === 1 ? 'cycle' : 'cycles'}.`
        );
      }
    } catch (err) {
      console.error('Error pausing subscription:', err);
      Alert.alert(
        'Error',
        err.response?.data?.error || 'Failed to pause subscription. Please try again.'
      );
    } finally {
      setActionLoading(false);
      setModalVisible(false);
      setPauseCycles('1');
    }
  };

  const handleResumeSubscription = async (subscription) => {
    if (!subscription || !userId) return;

    try {
      setLoading(true);
      
      const response = await axios.post(
        `${API_URL}/create-subscription/resume-subscription/${subscription.subscriptionId}`,
        {
          userId,
        }
      );
      
      if (response.data && response.data.success) {
        // Update the local state
        setSubscriptions(prevSubscriptions => 
          prevSubscriptions.map(sub => 
            sub.subscriptionId === subscription.subscriptionId
              ? { ...sub, status: 'active' }
              : sub
          )
        );
        
        Alert.alert('Success', 'Your subscription has been resumed successfully.');
      }
    } catch (err) {
      console.error('Error resuming subscription:', err);
      Alert.alert(
        'Error',
        err.response?.data?.error || 'Failed to resume subscription. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, subscription) => {
    setSelectedSubscription(subscription);
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedSubscription(null);
    setModalType(null);
    setPauseCycles('1');
    setCancelAtPeriodEnd(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#4CAF50';
      case 'paused':
        return '#FF9800';
      case 'cancelled':
      case 'scheduled_for_cancellation':
        return '#F44336';
      case 'completed':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <MaterialIcons name="check-circle" size={18} color="#4CAF50" />;
      case 'paused':
        return <MaterialIcons name="pause-circle-filled" size={18} color="#FF9800" />;
      case 'cancelled':
      case 'scheduled_for_cancellation':
        return <MaterialIcons name="cancel" size={18} color="#F44336" />;
      case 'completed':
        return <MaterialIcons name="done-all" size={18} color="#2196F3" />;
      default:
        return <MaterialIcons name="help" size={18} color="#757575" />;
    }
  };

  const renderSubscriptionItem = ({ item }) => {
    const isActive = item.status?.toLowerCase() === 'active';
    const isPaused = item.status?.toLowerCase() === 'paused';
    const isCancelled = 
      item.status?.toLowerCase() === 'cancelled' || 
      item.status?.toLowerCase() === 'scheduled_for_cancellation';

    return (
      <TouchableOpacity
        style={styles.subscriptionCard}
        onPress={() => openModal('details', item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.planNameContainer}>
            <Text style={styles.planName}>{item.planName || 'Nutrition Plan'}</Text>
            <View style={styles.statusContainer}>
              {getStatusIcon(item.status)}
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(item.status) },
                ]}
              >
                {item.status || 'Unknown'}
              </Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#757575" />
        </View>

        <View style={styles.divider} />

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Amount:</Text>
            <Text style={styles.infoValue}>
              ₹{item.amount ? (item.amount / 100).toFixed(2) : '0.00'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Billing Cycle:</Text>
            <Text style={styles.infoValue}>
              {item.billingCycle || 'Monthly'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Next Billing:</Text>
            <Text style={styles.infoValue}>
              {item.nextBillingDate ? formatDate(item.nextBillingDate) : 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          {isActive && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.pauseButton]}
                onPress={() => openModal('pause', item)}
              >
                <MaterialIcons name="pause" size={16} color="#FF9800" />
                <Text style={styles.pauseButtonText}>Pause</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => openModal('cancel', item)}
              >
                <MaterialIcons name="cancel" size={16} color="#F44336" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {isPaused && (
            <TouchableOpacity
              style={[styles.actionButton, styles.resumeButton]}
              onPress={() => handleResumeSubscription(item)}
            >
              <MaterialIcons name="play-arrow" size={16} color="#4CAF50" />
              <Text style={styles.resumeButtonText}>Resume</Text>
            </TouchableOpacity>
          )}

          {isCancelled && (
            <Text style={styles.cancelledText}>
              {item.status?.toLowerCase() === 'scheduled_for_cancellation'
                ? 'Will be cancelled at the end of billing period'
                : 'This subscription has been cancelled'}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome5 name="clipboard-list" size={60} color="#CCCCCC" />
      <Text style={styles.emptyTitle}>No Subscriptions Found</Text>
      <Text style={styles.emptyText}>
        You don't have any active subscriptions at the moment.
      </Text>
    </View>
  );

  const renderModal = () => {
    if (!selectedSubscription) return null;

    switch (modalType) {
      case 'cancel':
        return (
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="cancel" size={28} color="#F44336" />
              <Text style={styles.modalTitle}>Cancel Subscription</Text>
            </View>
            
            <Text style={styles.modalText}>
              Are you sure you want to cancel your subscription to{' '}
              <Text style={styles.highlightText}>
                {selectedSubscription.planName || 'Nutrition Plan'}
              </Text>
              ?
            </Text>
            
            <View style={styles.optionContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setCancelAtPeriodEnd(!cancelAtPeriodEnd)}
              >
                <View
                  style={[
                    styles.checkbox,
                    cancelAtPeriodEnd && styles.checkboxChecked,
                  ]}
                >
                  {cancelAtPeriodEnd && (
                    <MaterialIcons name="check" size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  Cancel at the end of the current billing period
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={closeModal}
                disabled={actionLoading}
              >
                <Text style={styles.cancelModalButtonText}>No, Keep It</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={handleCancelSubscription}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmModalButtonText}>Yes, Cancel</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
        
      case 'pause':
        return (
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="pause-circle-filled" size={28} color="#FF9800" />
              <Text style={styles.modalTitle}>Pause Subscription</Text>
            </View>
            
            <Text style={styles.modalText}>
              How many billing cycles would you like to pause your subscription?
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Number of Cycles:</Text>
              <TextInput
                style={styles.input}
                value={pauseCycles}
                onChangeText={setPauseCycles}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={closeModal}
                disabled={actionLoading}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={handlePauseSubscription}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmModalButtonText}>Pause</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
        
      case 'details':
        return (
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="description" size={28} color="#2196F3" />
              <Text style={styles.modalTitle}>Subscription Details</Text>
            </View>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Plan:</Text>
                <Text style={styles.detailValue}>
                  {selectedSubscription.planName || 'Nutrition Plan'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <View style={styles.statusDetailContainer}>
                  {getStatusIcon(selectedSubscription.status)}
                  <Text
                    style={[
                      styles.statusDetailText,
                      { color: getStatusColor(selectedSubscription.status) },
                    ]}
                  >
                    {selectedSubscription.status || 'Unknown'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount:</Text>
                <Text style={styles.detailValue}>
                  ₹{selectedSubscription.amount ? (selectedSubscription.amount / 100).toFixed(2) : '0.00'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Billing Cycle:</Text>
                <Text style={styles.detailValue}>
                  {selectedSubscription.billingCycle || 'Monthly'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Start Date:</Text>
                <Text style={styles.detailValue}>
                  {selectedSubscription.startDate ? formatDate(selectedSubscription.startDate) : 'N/A'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Next Billing:</Text>
                <Text style={styles.detailValue}>
                  {selectedSubscription.nextBillingDate ? formatDate(selectedSubscription.nextBillingDate) : 'N/A'}
                </Text>
              </View>
              
              {selectedSubscription.endDate && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>End Date:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedSubscription.endDate)}
                  </Text>
                </View>
              )}
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Subscription ID:</Text>
                <Text style={styles.detailValue}>
                  {selectedSubscription.subscriptionId || 'N/A'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeModal}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        );
        
      default:
        return null;
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading your subscriptions...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#2E7D32']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Subscriptions</Text>
        </View>
      </LinearGradient>

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={60} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchSubscriptions}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={subscriptions}
            renderItem={renderSubscriptionItem}
            keyExtractor={(item) => item.id || item._id || item.subscriptionId} // Use guaranteed unique id
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#4CAF50']}
                tintColor="#4CAF50"
              />
            }
          />
        )}
      </Animated.View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {renderModal()}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  subscriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planNameContainer: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },
  cardContent: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  pauseButton: {
    backgroundColor: '#FFF8E1',
  },
  pauseButtonText: {
    color: '#FF9800',
    fontWeight: '500',
    marginLeft: 4,
  },
  cancelButton: {
    backgroundColor: '#FFEBEE',
  },
  cancelButtonText: {
    color: '#F44336',
    fontWeight: '500',
    marginLeft: 4,
  },
  resumeButton: {
    backgroundColor: '#E8F5E9',
  },
  resumeButtonText: {
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 4,
  },
  cancelledText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#F44336',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    lineHeight: 24,
  },
  highlightText: {
    fontWeight: 'bold',
    color: '#333333',
  },
  optionContainer: {
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#757575',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    marginLeft: 12,
  },
  cancelModalButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelModalButtonText: {
    color: '#757575',
    fontWeight: '500',
  },
  confirmModalButton: {
    backgroundColor: '#4CAF50',
  },
  confirmModalButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    maxWidth: '60%',
    textAlign: 'right',
  },
  statusDetailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDetailText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  closeButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#333333',
    fontWeight: '500',
  },
});

export default SubscriptionManagementScreen;