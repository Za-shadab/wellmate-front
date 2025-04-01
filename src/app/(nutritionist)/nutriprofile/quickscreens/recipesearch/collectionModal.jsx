import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const CollectionModal = ({ visible, onClose, collections, onSelectCollection }) => {
  if (!collections) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={70} tint="dark" style={styles.blurOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to Collection</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {collections.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Feather name="folder" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No collections found</Text>
              </View>
            ) : (
              <FlatList
                data={collections}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.collectionItem}
                    onPress={() => {
                      console.log('Selected collection ID:', item._id);
                      onSelectCollection(item._id);
                      onClose();
                    }}
                  >
                    <View style={styles.collectionIcon}>
                      <Feather name="folder" size={24} color="#0080FF" />
                    </View>
                    <View style={styles.collectionInfo}>
                      <Text style={styles.collectionName}>{item.name}</Text>
                      <Text style={styles.collectionMeta}>
                        {item.items ? `${item.items.length} recipes` : '0 recipes'} • Created {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#ccc" />
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContainer}
              />
            )}
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  blurOverlay: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: height * 0.7,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  listContainer: {
    paddingVertical: 8,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  collectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  collectionMeta: {
    fontSize: 13,
    color: '#888',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#888',
  },
});

export default CollectionModal;