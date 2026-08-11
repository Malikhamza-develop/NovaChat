import React, {
  useEffect,
  useCallback,
  useState,
} from 'react';

import {
  KeyboardAvoidingView,
  Alert,
  Platform,
  StyleSheet,
  View,
  Text,
  Pressable,
} from 'react-native';


import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';


import {
  MainStackParamList,
} from '../../navigation/types';


import {
  useAuthStore,
} from '../../store/authStore';


import {
  useChatStore,
} from '../../store/chatStore';


import {
  getSocket,
  initializeSocket,
  sendMessage,
} from '../../services/socket/socket';
import type { Message } from '../../types/Message';


import { ChatHeader } from '../../components/chat/ChatHeader';
import { MessageList } from '../../components/chat/MessageList';
import { MessageInput } from '../../components/chat/MessageInput';


import colors from '../../theme/colors';
import { useThemeStore } from '../../theme/themeStore';



type Props =
  NativeStackScreenProps<
    MainStackParamList,
    'Chat'
  >;



const ChatScreen = ({
  route,
  navigation,
}:Props)=>{


const {
  receiverId,
  receiverName,
} = route.params;



const user =
useAuthStore(
 state=>state.user
);



const token =
useAuthStore(
 state=>state.token
);



const userId =
user?._id;



const messages =
useChatStore(
 state =>
 state.messages[receiverId] ?? []
);

const conversation = useChatStore(
 state => state.conversations.find(item => item.userId === receiverId)
);

const addMessage =
useChatStore(
 state=>state.addMessage
);



const loadConversation =
useChatStore(
 state=>state.loadConversation
);

const markConversationRead = useChatStore(
 state => state.markConversationRead
);

const retryMessage = useChatStore(
  state => state.retryMessage
);

const toggleReaction = useChatStore(
  state => state.toggleReaction
);

const deleteMessage = useChatStore(
  state => state.deleteMessage
);

const archiveConversation = useChatStore(
  state => state.archiveConversation
);

const pinConversation = useChatStore(
  state => state.pinConversation
);

const { colors } = useThemeStore();

const [replyTo, setReplyTo] = useState<Message | null>(null);



useEffect(()=>{


if(!token){
 return;
}



const socket =
initializeSocket(token);



const onMessage = (message: { _id: string; from: string }) => {
  if (message.from === receiverId) {
    socket.emit('messageDelivered', { messageId: message._id });
    socket.emit('messageRead', { messageId: message._id });
    markConversationRead(receiverId);
  }
};

socket?.on('message', onMessage);



return ()=>{

socket?.off('message', onMessage);

};


},[
token,
receiverId,
markConversationRead,
]);





useEffect(()=>{
  void (async () => {
    await loadConversation(receiverId);
    markConversationRead(receiverId);
    getSocket()?.emit('conversationRead', { fromUserId: receiverId });
  })();
},[
receiverId,
loadConversation,
markConversationRead,
]);





const handleSend =
useCallback(
(text:string)=>{


if(
!userId ||
!receiverId
){
return;
}



const clientId =
`client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;



const optimistic = {


_id:clientId,


clientId,


from:userId,


to:receiverId,


content:text,


replyTo: replyTo?._id ?? null,


status:'sending',


createdAt:
new Date()
.toISOString(),


};



addMessage(
optimistic
);



sendMessage(
receiverId,
text,
clientId
);

setReplyTo(null);

},
[
userId,
receiverId,
addMessage,
replyTo,
]
);

const handleReact = useCallback(
(messageId: string, emoji: string) => {
toggleReaction(messageId, emoji);
},
[toggleReaction],
);

const handleReply = useCallback((message: Message) => {
setReplyTo(message);
}, []);

const handleDelete = useCallback(
(messageId: string) => {
Alert.alert('Delete message', 'This message will be deleted for everyone.', [
{ text: 'Cancel', style: 'cancel' },
{ text: 'Delete', style: 'destructive', onPress: () => deleteMessage(messageId) },
]);
},
[deleteMessage],
);

const handleCopy = useCallback((text: string) => {
Alert.alert('Message', text);
}, []);





return (

<KeyboardAvoidingView

style={styles.container}

behavior={
Platform.OS === 'ios'
?
'padding'
:
undefined
}

>



<ChatHeader

name={receiverName}

image={conversation?.avatar}

online={conversation?.online}

typing={conversation?.typing}

lastSeen={conversation?.lastSeen}

onBack={()=>
navigation.goBack()
}

onProfilePress={() => navigation.navigate('UserProfile', {
  userId: receiverId,
  name: receiverName,
  avatar: conversation?.avatar,
  online: conversation?.online,
  lastSeen: conversation?.lastSeen,
})}

onMorePress={() => Alert.alert(receiverName, 'Conversation options', [
  { text: conversation?.pinned ? 'Unpin conversation' : 'Pin conversation', onPress: () => void pinConversation(receiverId) },
  { text: 'Archive conversation', onPress: () => { void archiveConversation(receiverId); navigation.goBack(); } },
  { text: 'Cancel', style: 'cancel' },
])}

/>




<View style={styles.messages}>


<MessageList

currentUserId={
userId ?? ''
}

messages={
messages
}

onRetryMessage={(message: any) => retryMessage(message.clientId)}
onReact={handleReact}
onReply={handleReply}
onDelete={handleDelete}
onCopy={handleCopy}

/>


</View>

{replyTo ? (
<View style={[styles.replyBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
<View style={[styles.replyBarContent, { borderLeftColor: colors.primary }]}>
<Text style={[styles.replyLabel, { color: colors.primary }]}>Replying to</Text>
<Text style={[styles.replyText, { color: colors.textSecondary }]} numberOfLines={1}>
{replyTo.content}
</Text>
</View>
<Pressable onPress={() => setReplyTo(null)} style={styles.replyClose}>
<Text style={[styles.replyCloseText, { color: colors.textMuted }]}>✕</Text>
</Pressable>
</View>
) : null}




<MessageInput

onSend={
handleSend
}

onTypingChange={(isTyping: boolean) =>
  getSocket()?.emit('typing', { toUserId: receiverId, isTyping })
}

/>



</KeyboardAvoidingView>

);

};



export default ChatScreen;



const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:
colors.background,
},


messages:{
flex:1,
},

replyBar: {
flexDirection: 'row',
alignItems: 'center',
paddingHorizontal: 16,
paddingVertical: 10,
borderTopWidth: 1,
},

replyBarContent: {
flex: 1,
borderLeftWidth: 3,
paddingLeft: 10,
},

replyLabel: {
fontSize: 12,
fontWeight: '600',
marginBottom: 2,
},

replyText: {
fontSize: 14,
},

replyClose: {
paddingHorizontal: 12,
paddingVertical: 6,
},

replyCloseText: {
fontSize: 18,
},

});
