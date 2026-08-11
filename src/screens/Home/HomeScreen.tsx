import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { HomeSectionItem } from '../../types/HomeSection';

import {
  StyleSheet,
  Alert,
  Text,
  View,
} from 'react-native';

import {
  FlashList,
} from '@shopify/flash-list';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';


import {
  MainStackParamList,
} from '../../navigation/types';


import { HomeHeader } from '../../components/home/HomeHeader';
import SearchBar from '../../components/home/SearchBar';
import SectionHeader from '../../components/home/SectionHeader';
import { ConversationCard } from '../../components/home/ConversationCard';
import EmptyChats from '../../components/home/EmptyChats';
import FloatingActionButton from '../../components/home/FloatingActionButton';
import { ConversationSummary } from '../../types/Message';
import {
  useChatStore,
} from '../../store/chatStore';


import { useThemeStore } from '../../theme/themeStore';
import staticColors from '../../theme/colors';



type Props = NativeStackScreenProps<
  MainStackParamList,
  'Home'
>;



const HomeScreen = ({
  navigation,
}: Props) => {

  const { colors } = useThemeStore();


const conversations = useChatStore(
  state => state.conversations
);


const loading = useChatStore(
  state => state.loading
);


const loadConversations = useChatStore(
  state => state.loadConversations
);


const seedTestConversations = useChatStore(
  state => state.seedTestConversations
);



const archiveConversation = useChatStore(
  state => state.archiveConversation
);


const pinConversation = useChatStore(
  state => state.pinConversation
);


const deleteConversation = useChatStore(
  state => state.deleteConversation
);



const [search,setSearch] =
useState('');

const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'pinned'>('all');



useEffect(()=>{

  loadConversations();

},[
  loadConversations
]);





const sections = useMemo(() => {

  const activeChats = conversations.filter(item => {
    if (item.archived) return false;
    if (filterMode === 'unread') return item.unreadCount > 0;
    if (filterMode === 'pinned') return item.pinned;
    return true;
  });

  const sortConversations = (
    items: typeof activeChats,
  ) => {

    return [...items].sort((a, b) => {

      if (a.unreadCount !== b.unreadCount) {
        return b.unreadCount - a.unreadCount;
      }

      return (
        new Date(b.lastAt).getTime() -
        new Date(a.lastAt).getTime()
      );

    });

  };

  const pinned = sortConversations(
    activeChats.filter(item => item.pinned),
  );

  const recent = sortConversations(
    activeChats.filter(item => !item.pinned),
  );

  const applySearch = (
    items: typeof activeChats,
  ) => {

    const keyword = search
      .trim()
      .toLowerCase();

    if (!keyword) {
      return items;
    }

    return items.filter(item =>
      item.name
        .toLowerCase()
        .includes(keyword) ||

      item.lastMessage
        .toLowerCase()
        .includes(keyword),
    );

  };

  return {

    pinned: applySearch(pinned),

    recent: applySearch(recent),

  };

}, [
  conversations,
  search,
  filterMode,
]);

const listData = useMemo<HomeSectionItem[]>(() => {

  const data: HomeSectionItem[] = [];

  if (sections.pinned.length > 0) {

    data.push({
      type: 'header',
      id: 'header-pinned',
      title: 'Pinned Chats',
      count: sections.pinned.length,
    });

    sections.pinned.forEach(item => {

      data.push({
        type: 'conversation',
        id: item.userId,
        conversation: item,
      });

    });

  }

  if (sections.recent.length > 0) {

    data.push({
      type: 'header',
      id: 'header-recent',
      title: 'Recent Chats',
      count: sections.recent.length,
    });

    sections.recent.forEach(item => {

      data.push({
        type: 'conversation',
        id: item.userId,
        conversation: item,
      });

    });

  }

  return data;

}, [sections]);





return (

<View style={styles.container}>


<HomeHeader

onProfilePress={()=>(
 navigation.navigate('Profile')
)}

onNotificationPress={() => Alert.alert('You’re all caught up', 'There are no new NovaChat notifications.')}

onArchivePress={() =>
    navigation.navigate('ArchivedChats')
  }

/>



<SearchBar

value={search}

onChangeText={setSearch}

onFilterPress={() => Alert.alert('Filter conversations', undefined, [
  { text: 'All chats', onPress: () => setFilterMode('all') },
  { text: 'Unread only', onPress: () => setFilterMode('unread') },
  { text: 'Pinned only', onPress: () => setFilterMode('pinned') },
  { text: 'Cancel', style: 'cancel' },
])}

/>

{filterMode !== 'all' ? (
  <View style={styles.filterRow}>
    <Text style={styles.filterLabel}>{filterMode === 'unread' ? 'Unread conversations' : 'Pinned conversations'}</Text>
    <Text onPress={() => setFilterMode('all')} style={styles.clearFilter}>Clear filter</Text>
  </View>
) : null}




{
loading ? null :

listData.length === 0 ?


<EmptyChats

onPress={
 seedTestConversations
}

/>


:


<>

{
sections.pinned.length > 0 &&

<SectionHeader

title="Pinned Chats"

actionText={
 `${sections.pinned.length}`
}

/>

}



{
sections.pinned.length > 0 &&

<FlashList

data={sections.pinned}

keyExtractor={
 item => item.userId
}

showsVerticalScrollIndicator={false}

renderItem={({item})=>(

<ConversationCard

conversation={item}


onPress={()=>(
navigation.navigate(
'Chat',
{
conversationId:item.userId,
receiverId:item.userId,
receiverName:item.name,
}
)
)}


onArchive={()=>(
archiveConversation(
item.userId
)
)}


onPin={()=>(
pinConversation(
item.userId
)
)}


onDelete={()=>(
deleteConversation(
item.userId
)
)}


/>

)}

/>

}





{
sections.recent.length > 0 &&

<SectionHeader

title="Recent Chats"

actionText={
`${sections.recent.length}`
}

/>

}



<FlashList

data={sections.recent}

keyExtractor={
item=>item.userId
}

showsVerticalScrollIndicator={false}

contentContainerStyle={
styles.listContent
}

renderItem={({item})=>(


<ConversationCard

conversation={item}


onPress={()=>(
navigation.navigate(
'Chat',
{
conversationId:item.userId,
receiverId:item.userId,
receiverName:item.name,
}
)
)}


onArchive={()=>(
archiveConversation(
item.userId
)
)}


onPin={()=>(
pinConversation(
item.userId
)
)}


onDelete={()=>(
deleteConversation(
item.userId
)
)}


/>


)}

/>

</>

}



<FloatingActionButton

onNewChat={() => navigation.navigate('NewChat')}

/>



</View>

);

};



export default HomeScreen;




const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:staticColors.background,
},



listContent:{
paddingBottom:120,
paddingTop:4,
},

filterRow: {
  marginHorizontal: 20,
  marginTop: -10,
  marginBottom: 13,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

filterLabel: {
  color: staticColors.primary,
  fontSize: 12,
  fontWeight: '700',
},

clearFilter: {
  color: staticColors.textSecondary,
  fontSize: 12,
  fontWeight: '700',
},


});
