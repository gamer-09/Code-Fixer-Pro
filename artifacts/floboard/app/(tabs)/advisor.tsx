import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { fmt, fmtChg, useMarket } from '@/context/MarketContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : 'http://localhost:80';

const QUICK_QUESTIONS = [
  'What are the top market movers today?',
  'Is now a good time to buy Bitcoin?',
  'Explain the impact of rising interest rates',
  'Best sectors to invest in right now?',
  'How is the US economy performing?',
  'Should I be worried about inflation?',
];

const INITIAL_MSG: ChatMessage = {
  id: 'init',
  role: 'assistant',
  content:
    "Hi! I'm FloAI, your intelligent market advisor. I have access to live market data and can help you understand financial markets, analyze trends, and make sense of economic news.\n\nAsk me anything about stocks, crypto, forex, commodities, or macro economics.",
  timestamp: new Date(),
};

function buildSystemPrompt(data: Record<string, { regularMarketPrice: number; regularMarketChangePercent: number }>) {
  const lines = [
    `You are FloAI, an expert financial advisor powered by Anthropic Claude. Today is ${new Date().toDateString()}.`,
    '',
    'You have access to live market data. Here is a snapshot:',
    '',
  ];

  const entries = Object.entries(data).slice(0, 20);
  for (const [sym, d] of entries) {
    lines.push(`${sym}: $${fmt(d.regularMarketPrice)} (${fmtChg(d.regularMarketChangePercent)})`);
  }

  lines.push(
    '',
    'Guidelines:',
    '- Provide educational, balanced financial context',
    '- Reference the live data when relevant',
    '- Always note that this is informational, not personal financial advice',
    '- Be concise but thorough; use bullet points where helpful',
    '- Stay factual; highlight uncertainty when present',
  );

  return lines.join('\n');
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const colors = useColors();
  const isUser = msg.role === 'user';

  return (
    <View style={[styles.bubbleWrap, isUser ? styles.bubbleRight : styles.bubbleLeft]}>
      {!isUser && (
        <View style={[styles.aiIcon, { backgroundColor: colors.gainDim, borderColor: 'rgba(0,229,160,0.2)' }]}>
          <Ionicons name="flash" size={12} color={colors.gain} />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: colors.blue, borderColor: 'transparent' }]
            : [styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.rim }],
        ]}
      >
        <Text style={[styles.bubbleText, { color: isUser ? '#fff' : colors.t1 }]}>{msg.content}</Text>
        <Text style={[styles.timeText, { color: isUser ? 'rgba(255,255,255,0.5)' : colors.t4 }]}>
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

function TypingIndicator() {
  const colors = useColors();
  const anim = useRef<{ [k: string]: ReturnType<typeof setTimeout> }>({});
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d + 1) % 4), 450);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={[styles.bubbleWrap, styles.bubbleLeft]}>
      <View style={[styles.aiIcon, { backgroundColor: colors.gainDim, borderColor: 'rgba(0,229,160,0.2)' }]}>
        <Ionicons name="flash" size={12} color={colors.gain} />
      </View>
      <View style={[styles.bubble, styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.rim, minWidth: 60 }]}>
        <Text style={[styles.bubbleText, { color: colors.t3, letterSpacing: 3 }]}>
          {'●'.repeat(dots) + '○'.repeat(3 - dots)}
        </Text>
      </View>
    </View>
  );
}

export default function AdvisorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string }>();
  const { data } = useMarket();
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MSG]);
  const messagesRef = useRef<ChatMessage[]>([INITIAL_MSG]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const listRef = useRef<FlatList>(null);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const usedParamRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (params.q && !usedParamRef.current) {
      usedParamRef.current = true;
      setTimeout(() => sendMessage(params.q!), 400);
    }
  }, [params.q]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };
      const aiId = (Date.now() + 1).toString();
      const aiMsg: ChatMessage = {
        id: aiId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      const prev = messagesRef.current;
      const nextMessages = [aiMsg, userMsg, ...prev];
      setMessages(nextMessages);
      messagesRef.current = nextMessages;
      setStreaming(true);
      setInput('');

      const historyForApi = [...prev].reverse().map((m) => ({ role: m.role, content: m.content }));
      historyForApi.push({ role: 'user', content: trimmed });

      let streamedContent = '';

      try {
        const response = await fetch(`${BASE_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: historyForApi,
            systemPrompt: buildSystemPrompt(data),
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const raw = line.slice(6).trim();
              if (raw === '[DONE]') break;
              try {
                const parsed = JSON.parse(raw);
                if (parsed.content) {
                  streamedContent += parsed.content;
                  setMessages((cur) =>
                    cur.map((m) => (m.id === aiId ? { ...m, content: streamedContent } : m))
                  );
                }
                if (parsed.error) {
                  setMessages((cur) =>
                    cur.map((m) => (m.id === aiId ? { ...m, content: `Error: ${parsed.error}` } : m))
                  );
                }
              } catch {}
            }
          }
        }

        if (!streamedContent) {
          setMessages((cur) =>
            cur.map((m) =>
              m.id === aiId ? { ...m, content: 'No response received. Please try again.' } : m
            )
          );
        }
      } catch (e) {
        setMessages((cur) =>
          cur.map((m) =>
            m.id === aiId
              ? { ...m, content: 'Connection error. Please check your network and try again.' }
              : m
          )
        );
      } finally {
        setStreaming(false);
      }
    },
    [data, streaming]
  );

  const handleSend = () => sendMessage(input);

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.base, borderBottomColor: colors.rim }]}>
        <View>
          <Text style={[styles.pageTitle, { color: colors.t1 }]}>FloAI</Text>
          <Text style={[styles.subTitle, { color: colors.gain }]}>AI Market Advisor</Text>
        </View>
        <View style={[styles.statusChip, { backgroundColor: colors.gainDim, borderColor: 'rgba(0,229,160,0.2)' }]}>
          <View style={[styles.statusDot, { backgroundColor: colors.gain }]} />
          <Text style={[styles.statusText, { color: colors.gain }]}>ONLINE</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Messages (inverted) */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <MessageBubble msg={item} />}
          inverted
          contentContainerStyle={{ padding: 14, paddingBottom: 10 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={streaming ? <TypingIndicator /> : null}
        />

        {/* Quick questions */}
        {messages.length === 1 && !streaming && (
          <View>
            <FlatList
              data={QUICK_QUESTIONS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(q, i) => String(i)}
              contentContainerStyle={styles.quickScroll}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => sendMessage(item)}
                  style={({ pressed }) => [
                    styles.quickChip,
                    { backgroundColor: colors.card, borderColor: pressed ? colors.blue : colors.rim },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={[styles.quickText, { color: colors.t2 }]}>{item}</Text>
                </Pressable>
              )}
            />
          </View>
        )}

        {/* Input bar */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.base,
              borderTopColor: colors.rim,
              paddingBottom: Platform.OS === 'web' ? 84 : insets.bottom + 8,
            },
          ]}
        >
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.card, borderColor: colors.rim, color: colors.t1 }]}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about markets, stocks, crypto..."
            placeholderTextColor={colors.t4}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <Pressable
            onPress={handleSend}
            disabled={streaming || !input.trim()}
            style={[
              styles.sendBtn,
              {
                backgroundColor: streaming || !input.trim() ? colors.card : colors.gain,
                borderColor: colors.rim,
              },
            ]}
          >
            {streaming ? (
              <ActivityIndicator size="small" color={colors.t3} />
            ) : (
              <Feather name="send" size={16} color={streaming || !input.trim() ? colors.t4 : '#000'} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  pageTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  subTitle: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  bubbleWrap: { marginBottom: 10 },
  bubbleLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bubbleRight: { flexDirection: 'row', justifyContent: 'flex-end' },
  aiIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bubble: { maxWidth: '80%', borderRadius: 12, borderWidth: 1, padding: 12 },
  userBubble: { borderBottomRightRadius: 3 },
  aiBubble: { borderTopLeftRadius: 3 },
  bubbleText: { fontSize: 13, lineHeight: 20, fontFamily: 'Inter_400Regular' },
  timeText: { fontSize: 9, marginTop: 4, textAlign: 'right' },
  quickScroll: { paddingHorizontal: 14, paddingVertical: 8, gap: 6 },
  quickChip: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  quickText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingTop: 8,
    paddingHorizontal: 14,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    maxHeight: 100,
    fontFamily: 'Inter_400Regular',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
