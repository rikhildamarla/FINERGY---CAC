import React, { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text, TouchableOpacity, Image, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Network from 'expo-network';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';


import Login from './screens/Login';
import Signup from './screens/Signup';
import EvaluationQuestions from './screens/EvaluationQuestions';
import HomeScreen from './screens/HomeScreen';
import GroupScreen from './screens/GroupScreen';
import ESGScreen from './screens/ESGScreen';
import BudgetScreen from './screens/BudgetScreen';

//testing but ima still keep it
console.log('Screen Components:', {
  HomeScreen,
  GroupScreen,
  ESGScreen,
  BudgetScreen
});

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Header Component
const Header = () => (
  <View style={styles.headerContainer}>
    <View style={styles.headerLeft}>
      <Image
        source={require('./assets/logo.png')}
        style={styles.headerLogo}
        resizeMode="contain"
      />
      <View>
        <Text style={styles.headerTitle}>FINERGY</Text>
        <Text style={styles.headerSubtitle}>Clean & Green</Text>
      </View>
    </View>
    <TouchableOpacity style={styles.headerRight}>
      <Ionicons name="settings-outline" size={24} color="white" />
    </TouchableOpacity>
  </View>
);

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: '#333',
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666',
        header: () => <Header />,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Group"
        component={GroupScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ESG"
        component={ESGScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

//welcome-page
function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Image
        source={require('./assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Welcome to Finergy!</Text>
      <Text style={styles.subtitle}>
        Make sustainable energy choices that save the planet and your wallet!
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('Signup')}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>
          Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );
}

//auth-Nav
function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#000' }
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}

//main app stuff
export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [hasCompletedEvaluation, setHasCompletedEvaluation] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
      
      if (user) {
        checkEvaluationStatus(user.uid);
      }
    });

    return unsubscribe;
  }, [initializing]);

  const checkEvaluationStatus = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const data = userDoc.data();
      setHasCompletedEvaluation(data?.evaluationResults?.completedAt != null);
    } catch (error) {
      console.error('Error checking evaluation status:', error);
      setHasCompletedEvaluation(false);
    }
  };
  
  if (initializing) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#000' }
          }}
        >
        {!user ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Signup" component={Signup} />
            
          </>
        ) : !hasCompletedEvaluation ? (
          <Stack.Screen 
            name="EvaluationQuestions" 
            component={EvaluationQuestions}
            options={{ gestureEnabled: false }}
          />
        ) : (
          <Stack.Screen 
            name="MainApp" 
            component={TabNavigator}
            options={{ gestureEnabled: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  </>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingTop: 55,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#666',
    fontSize: 12,
  },
  headerRight: {
    padding: 8,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
});
