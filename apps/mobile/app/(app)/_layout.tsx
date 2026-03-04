import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function AppLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#111827', headerShown: false }}>
      <Tabs.Screen name="index" options={{
        title: 'Início',
        tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="receitas" options={{
        title: 'Receitas',
        tabBarIcon: ({ color, size }) => <Ionicons name="trending-up-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="despesas" options={{
        title: 'Despesas',
        tabBarIcon: ({ color, size }) => <Ionicons name="trending-down-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="investimentos" options={{
        title: 'Invest.',
        tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="novo" options={{
        title: 'Novo',
        tabBarIcon: ({ color, size }) => <Ionicons name="add-circle-outline" size={size} color={color} />,
      }} />
    </Tabs>
  )
}
