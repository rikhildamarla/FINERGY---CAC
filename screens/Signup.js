import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';



const Signup = ({ navigation }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
  
    const handleSignup = async () => {
        if (password !== confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          return;
        }

    
        setLoading(true);
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          
          const userDocRef = doc(db, 'users', userCredential.user.uid);
          await setDoc(userDocRef, {
            profile: {
              username: fullName,
              email: email,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            },
            settings: {
              notifications: true,
              theme: 'dark'
            }
          });
    
        } catch (error) {
          console.error('Signup error:', error);
          Alert.alert('Error', error.message);
        } finally {
          setLoading(false);
        }
        
    };
    
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>Create Account</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#666"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#666"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <Text style={styles.termsText}>
          By signing up, you agree to our Terms of Service and Privacy Policy
        </Text>

        <TouchableOpacity 
          style={styles.signupButton}
          onPress={handleSignup}
        >
          <Text style={styles.signupButtonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    color: '#fff',
    width: '100%',
  },
  termsText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  signupButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    padding: 15,
  },
  loginButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
});

export default Signup;