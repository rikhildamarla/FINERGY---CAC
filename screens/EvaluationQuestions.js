import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  TextInput,
  Alert
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

const questions = [
    {
      id: 1,
      text: "How large is your home?",
      options: [
        { text: "Small (under 1,000 sq ft)", points: 3 },
        { text: "Medium (1,000-2,000 sq ft)", points: 2 },
        { text: "Large (2,000-3,000 sq ft)", points: 1 },
        { text: "Very large (over 3,000 sq ft)", points: 0 }
      ]
    },
    {
      id: 2,
      text: "When was your home built?",
      options: [
        { text: "After 2010", points: 3 },
        { text: "1990–2010", points: 2 },
        { text: "1970–1990", points: 1 },
        { text: "Before 1970", points: 0 }
      ]
    },
    {
      id: 3,
      text: "What type of heating and cooling system do you use?",
      options: [
        { text: "High-efficiency system (e.g., ENERGY STAR-certified)", points: 3 },
        { text: "Modern system (less than 10 years old)", points: 2 },
        { text: "Standard system (10–20 years old)", points: 1 },
        { text: "Older system (over 20 years old)", points: 0 }
      ]
    },
    {
      id: 4,
      text: "How would you rate the insulation in your home?",
      options: [
        { text: "Excellent (newly insulated or well-maintained)", points: 3 },
        { text: "Good (some insulation updates)", points: 2 },
        { text: "Average (standard insulation, no upgrades)", points: 1 },
        { text: "Poor (little to no insulation upgrades)", points: 0 }
      ]
    },
    {
      id: 5,
      text: "What type of windows do you have?",
      options: [
        { text: "ENERGY STAR-rated or double-pane windows", points: 3 },
        { text: "Newer windows with some efficiency features", points: 2 },
        { text: "Standard single-pane windows", points: 1 },
        { text: "Older, inefficient windows", points: 0 }
      ]
    },
    {
      id: 6,
      text: "What percentage of your home uses energy-efficient lighting (e.g., LEDs, CFLs)?",
      options: [
        { text: "90–100%", points: 3 },
        { text: "50–89%", points: 2 },
        { text: "10–49%", points: 1 },
        { text: "Less than 10%", points: 0 }
      ]
    },
    {
      id: 7,
      text: "How energy-efficient are your major appliances (refrigerator, dishwasher, washer/dryer)?",
      options: [
        { text: "Mostly energy-efficient models (ENERGY STAR-certified)", points: 3 },
        { text: "Some energy-efficient models", points: 2 },
        { text: "Standard models with moderate energy efficiency", points: 1 },
        { text: "Older, inefficient models", points: 0 }
      ]
    },
    {
      id: 8,
      text: "What type of water heating system do you use?",
      options: [
        { text: "Tankless or solar water heater", points: 3 },
        { text: "High-efficiency tank water heater", points: 2 },
        { text: "Standard tank water heater", points: 1 },
        { text: "Older water heater (over 15 years old)", points: 0 }
      ]
    },
    {
      id: 9,
      text: "What is your primary mode of transportation?",
      options: [
        { text: "Electric vehicle (EV)", points: 3 },
        { text: "Hybrid vehicle", points: 2 },
        { text: "Fuel-efficient gasoline vehicle", points: 1 },
        { text: "Standard gasoline vehicle", points: 0 }
      ]
    },
    {
      id: 10,
      text: "Do you have any renewable energy systems (e.g., solar panels) installed?",
      options: [
        { text: "Yes, I generate more than 50% of my energy from renewables", points: 3 },
        { text: "Yes, but it covers less than 50% of my energy", points: 2 },
        { text: "No, but I’m considering installing renewables", points: 1 },
        { text: "No, and I’m not considering it", points: 0 }
      ]
    },
    {
      id: 11,
      text: "Do you use smart devices to optimize energy consumption (e.g., smart thermostats, smart plugs)?",
      options: [
        { text: "Yes, in most areas of the home", points: 3 },
        { text: "Yes, in some areas", points: 2 },
        { text: "No, but planning to install some", points: 1 },
        { text: "No, not interested", points: 0 }
      ]
    },
    {
      id: 12,
      text: "How often do you actively practice energy-saving habits (e.g., turning off lights, unplugging electronics)?",
      options: [
        { text: "Always", points: 3 },
        { text: "Often", points: 2 },
        { text: "Sometimes", points: 1 },
        { text: "Rarely", points: 0 }
      ]
    },
    {
      id: 13,
      text: "Do you have a budget dedicated to energy-saving upgrades (e.g., appliances, insulation)?",
      options: [
        { text: "Yes, regularly set aside funds", points: 3 },
        { text: "Occasionally set aside funds", points: 2 },
        { text: "No, but interested in starting", points: 1 },
        { text: "No, and not planning to budget for energy efficiency", points: 0 }
      ]
    },
    {
      id: 14,
      text: "What is your average monthly energy bill?",
      options: [
        { text: "Less than $100", points: 3 },
        { text: "$100–$200", points: 2 },
        { text: "$200–$300", points: 1 },
        { text: "Over $300", points: 0 }
      ]
    },
    {
      id: 15,
      text: "Do you participate in local energy-saving programs or community challenges?",
      options: [
        { text: "Actively involved", points: 3 },
        { text: "Occasionally participate", points: 2 },
        { text: "Interested but haven't participated yet", points: 1 },
        { text: "Not involved and not interested", points: 0 }
      ]
    }
  ];

  const EvaluationQuestions = ({ navigation }) => {
    const [showIntro, setShowIntro] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [zipCode, setZipCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
  
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const cardOpacity = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
  
    useEffect(() => {
      const checkAuth = () => {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert(
            'Authentication Required',
            'Please log in to continue.',
            [
              {
                text: 'OK',
                onPress: () => navigation.replace('Login')
              }
            ]
          );
        } else {
          setIsAuthenticated(true);
        }
      };
  
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (!user) {
          navigation.replace('Login');
        } else {
          setIsAuthenticated(true);
        }
      });
  
      checkAuth();
      startIntroAnimation();
  
      return () => unsubscribe();
    }, []);
  
    const calculateScore = () => {
      const totalPoints = Object.values(answers).reduce((sum, answer) => sum + answer.points, 0);
      const maxPossiblePoints = 45; // 3 points × 15 questions
      const score = 1 + ((totalPoints * 9) / maxPossiblePoints);
      return Math.round(score * 10) / 10;
    };
  
    const validateZipCode = (zip) => {
      const zipRegex = /^\d{5}$/;
      return zipRegex.test(zip);
    };
  
    const handleComplete = async () => {
        if (!validateZipCode(zipCode)) {
          Alert.alert('Invalid ZIP Code', 'Please enter a valid 5-digit ZIP code');
          return;
        }
    
        if (!auth.currentUser) {
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please log in again.',
            [
              {
                text: 'OK',
                onPress: () => navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  })
                )
              }
            ]
          );
          return;
        }
    
        setIsSubmitting(true);
        try {
          const userId = auth.currentUser.uid;
          const score = calculateScore();
          
          const userDocRef = doc(db, 'users', userId);
          
          const userData = {
            profile: {
              zipCode: zipCode,
              lastUpdated: new Date().toISOString()
            },
            evaluationResults: {
              score: score,
              completedAt: new Date().toISOString(),
              answers: answers
            }
          };
    
          await setDoc(userDocRef, userData, { merge: true });
          
          // Reset navigation stack and go to Home
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            })
          );
    
        } catch (err) {
          console.error('Submission error details:', err);
          
          let errorMessage = 'Failed to save evaluation results. ';
          
          if (err.code === 'permission-denied') {
            errorMessage += 'You do not have permission to save data. Please log out and log in again.';
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })
            );
          } else if (err.code === 'unavailable') {
            errorMessage += 'Server is temporarily unavailable. Please try again later.';
          } else if (err.code === 'unauthenticated') {
            errorMessage += 'Your session has expired. Please log in again.';
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })
            );
          } else {
            errorMessage += 'Please try again or contact support if the problem persists.';
          }
    
          Alert.alert(
            'Error',
            errorMessage,
            [{ text: 'OK' }]
          );
        } finally {
          setIsSubmitting(false);
        }
      };
    
      
    const startIntroAnimation = () => {
      Animated.sequence([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          setCurrentStep(1);
          textOpacity.setValue(0);
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }).start();
        }, 2000);
      });
    };
  
    const handleStartEvaluation = () => {
      setShowIntro(false);
    };
  
    const handleAnswer = (questionId, option) => {
      setAnswers(prev => ({
        ...prev,
        [questionId]: option
      }));
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      }
    };
  
    const renderProgressBar = () => {
      const progress = ((currentQuestion + 1) / questions.length) * 100;
      return (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      );
    };
  
    const renderQuestion = () => {
        const currentQ = questions[currentQuestion];
        return (
          <View style={styles.optionsContainer}>
            {currentQ.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  answers[currentQ.id]?.text === option.text && 
                  styles.selectedOption
                ]}
                onPress={() => handleAnswer(currentQ.id, option)}
              >
                <Text style={[
                  styles.optionText,
                  answers[currentQ.id]?.text === option.text && 
                  styles.selectedOptionText
                ]}>
                  {option.text}
                </Text>
                {answers[currentQ.id]?.text === option.text && (
                  <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        );
      };
    
  
      const renderFinalStep = () => (
        <View style={styles.finalStepContainer}>
          <Text style={styles.question}>Almost done! Please enter your ZIP code:</Text>
          <TextInput
            style={styles.zipCodeInput}
            value={zipCode}
            onChangeText={setZipCode}
            placeholder="Enter ZIP code"
            placeholderTextColor="#666"
            keyboardType="number-pad"
            maxLength={5}
          />
          <TouchableOpacity 
            style={[styles.completeButton, { marginTop: 20 }]}
            onPress={handleComplete}
            disabled={isSubmitting || !zipCode}
          >
            <Text style={styles.completeButtonText}>
              {isSubmitting ? 'Submitting...' : 'Complete Evaluation'}
            </Text>
          </TouchableOpacity>
        </View>
      );          
  
    if (showIntro) {
      return (
        <SafeAreaView style={styles.container}>
          <ExpoStatusBar style="light" />
          
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
            <BlurView intensity={100} style={StyleSheet.absoluteFill} tint="dark" />
          </Animated.View>
  
          <Animated.View style={[styles.card, { opacity: cardOpacity }]}>
            <Animated.Text style={[styles.cardText, { opacity: textOpacity }]}>
              {currentStep === 0 
                ? "WELCOME USER!" 
                : "TAKE THIS TEST TO EVALUATE YOUR HOME ENERGY SCORE.."}
            </Animated.Text>
  
            {currentStep === 1 && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.startButton}
                  onPress={handleStartEvaluation}
                >
                  <Text style={styles.buttonText}>START EVALUATION</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </SafeAreaView>
      );
    }
  
    return (
        <SafeAreaView style={styles.container}>
          <ExpoStatusBar style="light" />
          {showIntro ? (
            <>
              <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
                <BlurView intensity={100} style={StyleSheet.absoluteFill} tint="dark" />
              </Animated.View>
    
              <Animated.View style={[styles.card, { opacity: cardOpacity }]}>
                <Animated.Text style={[styles.cardText, { opacity: textOpacity }]}>
                  {currentStep === 0 
                    ? "WELCOME USER!" 
                    : "TAKE THIS TEST TO EVALUATE YOUR HOME ENERGY SCORE.."}
                </Animated.Text>
    
                {currentStep === 1 && (
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                      style={styles.startButton}
                      onPress={handleStartEvaluation}
                    >
                      <Text style={styles.buttonText}>START EVALUATION</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Animated.View>
            </>
          ) : (
            <>
              {renderProgressBar()}
              <View style={styles.questionCard}>
                <ScrollView 
                  style={styles.content}
                  contentContainerStyle={styles.contentContainer}
                >
                  {currentQuestion === questions.length ? (
                    renderFinalStep()
                  ) : (
                    <>
                      <Text style={styles.question}>
                        {questions[currentQuestion].text}
                      </Text>
                      {renderQuestion()}
                    </>
                  )}
                </ScrollView>
    
                {currentQuestion < questions.length && (
                  <View style={styles.footer}>
                    {currentQuestion > 0 && (
                      <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => setCurrentQuestion(prev => prev - 1)}
                      >
                        <Ionicons name="arrow-back" size={24} color="#007AFF" />
                        <Text style={styles.backButtonText}>Previous</Text>
                      </TouchableOpacity>
                    )}
                    {answers[questions[currentQuestion].id] && (
                      <TouchableOpacity 
                        style={styles.nextButton}
                        onPress={() => setCurrentQuestion(prev => prev + 1)}
                      >
                        <Text style={styles.nextButtonText}>Next</Text>
                        <Ionicons name="arrow-forward" size={24} color="#007AFF" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </>
          )}
        </SafeAreaView>
      );
    };
    
    const styles = StyleSheet.create({
        zipCodeContainer: {
        marginTop: 20,
      },
        zipCodeInput: {
        backgroundColor: '#1A1A1A',
        padding: 15,
        borderRadius: 12,
        color: '#fff',
        fontSize: 16,
        marginTop: 10,
    },
        
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    position: 'absolute',
    top: '40%',
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
  },
  cardText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#1A1A1A',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  questionCard: {
    flex: 1,
    margin: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  question: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 30,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#0A2A4A',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
  },
  selectedOptionText: {
    color: '#007AFF',
  },
  footer: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 8,
  },
  completeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EvaluationQuestions;