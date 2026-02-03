import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import {
  AddScreen,
  GoalsScreen,
  HomeScreen,
  SettingsScreen,
  TransactionDetailScreen,
  TransactionsScreen,
} from './src/screens';
import { AppDataProvider } from './src/data';
import { ToastProvider } from './src/components/Toast';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const Tabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.ink,
      tabBarInactiveTintColor: colors.muted,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        height: 64,
        paddingTop: 6,
        paddingBottom: 10,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.2,
      },
      tabBarIcon: ({ color, size }) => {
        let name: keyof typeof Ionicons.glyphMap = 'home';

        if (route.name === 'Resumen') name = 'home';
        if (route.name === 'Movimientos') name = 'swap-vertical';
        if (route.name === 'Nuevo') name = 'add-circle';
        if (route.name === 'Objetivos') name = 'sparkles';
        if (route.name === 'Ajustes') name = 'settings';

        return <Ionicons name={name} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Resumen" component={HomeScreen} />
    <Tab.Screen name="Movimientos" component={TransactionsScreen} />
    <Tab.Screen name="Nuevo" component={AddScreen} />
    <Tab.Screen name="Objetivos" component={GoalsScreen} />
    <Tab.Screen name="Ajustes" component={SettingsScreen} />
  </Tab.Navigator>
);

export default function App() {
  return (
    <AppDataProvider>
      <ToastProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </ToastProvider>
    </AppDataProvider>
  );
}
