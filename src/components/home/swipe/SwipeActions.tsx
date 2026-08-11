import React, { memo } from 'react';

import {
  View,
  StyleSheet,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

import SwipeActionButton from './SwipeActionButton';


interface SwipeActionsProps {
  onArchive: () => void;
  onPin: () => void;
  onDelete: () => void;
}


const SwipeActions = ({
  onArchive,
  onPin,
  onDelete,
}: SwipeActionsProps) => {

  return (
    <View style={styles.container}>

      <SwipeActionButton
        label="Archive"
        backgroundColor="#6366F1"
        onPress={onArchive}
        icon={
          <Icon
            name="archive-outline"
            size={22}
            color="#FFFFFF"
          />
        }
      />


      <SwipeActionButton
        label="Pin"
        backgroundColor="#F59E0B"
        onPress={onPin}
        icon={
          <Icon
            name="pin-outline"
            size={22}
            color="#FFFFFF"
          />
        }
      />


      <SwipeActionButton
        label="Delete"
        backgroundColor="#EF4444"
        onPress={onDelete}
        icon={
          <Icon
            name="trash-outline"
            size={22}
            color="#FFFFFF"
          />
        }
      />

    </View>
  );
};


export default memo(SwipeActions);



const styles = StyleSheet.create({

  container:{
    flexDirection:'row',
    height:'100%',
  },

});