import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Ionicons } from '@expo/vector-icons';

const CHALLENGES = [
    "Turn off lights when leaving rooms",
    "Unplug electronics not in use",
    "Use natural light during daytime",
    "Meatless Meals: Go meatless for 5 meals this week.",
    "Reduce Plastic Use: Avoid single-use plastics completely for a week.",
    "Local Produce: Buy only local fruits and vegetables for your groceries.",
    "Compost Setup: Start a compost bin and collect kitchen scraps.",
    "Plant a Tree: Plant one tree in your yard or community.",
    "Reusable Bags Only: Use only reusable bags for all shopping.",
    "Energy Audit: Identify three ways to reduce energy use in your home.",
    "Public Transport: Use public transport for at least 5 trips this week.",
    "DIY Cleaners: Make three different eco-friendly cleaning products.",
    "Declutter for Donation: Donate at least 10 items you no longer use.",
    "Clothing Swap: Swap at least 3 items of clothing with friends.",
    "Water-Saving Measures: Take shorter showers (5 minutes max) for the week.",
    "Plant-Based Cooking: Cook at least 5 plant-based meals.",
    "Sustainable Seafood: Buy seafood from sustainable sources for all meals.",
    "Homemade Beauty Products: Create at least 2 personal care products.",
    "Research Renewable Energy: Investigate 2 renewable energy options for home use.",
    "Carpool: Share rides with at least 2 different people this week.",
    "Switch to LEDs: Replace at least 5 incandescent bulbs with LED lights.",
    "Mindful Spending: Track all non-essential purchases and avoid them for the week.",
    "Digital Declutter: Delete 100 unnecessary files or emails.",
    "Start a Garden: Plant at least 3 herbs or vegetables.",
    "Share Tips: Share at least 3 sustainability tips with family or friends.",
    "Thrift Shopping: Buy at least 3 items from a thrift store.",
    "Eco-Friendly Brands: Purchase only from eco-conscious brands for the week.",
    "Unplug Devices: Unplug all non-essential electronics every night.",
    "Car-Free Days: Go car-free for 3 days this week.",
    "Natural Pest Control: Use homemade pest control for any issues in your garden.",
    "Community Clean-Up: Organize or join a clean-up event and collect at least 5 bags of trash.",
    "Refillable Products: Use only refillable containers for personal care items.",
    "Seasonal Eating: Plan meals using only seasonal ingredients for the week.",
    "Tool Sharing: Borrow tools from a neighbor instead of buying new.",
    "Paperless: Go paperless for bills and notes this week.",
    "Sustainable Reading: Read 2 articles or a chapter from a book on sustainability.",
    "Meal Planning: Plan and prepare meals to reduce food waste, aiming to use up everything.",
    "Eco-Friendly Pet Care: Switch to at least 1 sustainable pet product for the week.",
    "Local Exploration: Visit at least 2 local parks or nature reserves.",
    "Community Garden Participation: Attend a meeting or work day at a local community garden.",
    "Biodegradable Products: Use only biodegradable products for cleaning and personal care.",
    "No New Clothes: Commit to not buying any new clothes for the week.",
    "Natural Decorations: Create or use 3 natural or reusable decorations.",
    "Energy Tracking: Monitor and record your energy use daily.",
    "Leftovers Challenge: Use leftovers for at least 3 meals this week.",
    "Wildlife Habitat: Create a small space in your yard to attract local wildlife.",
    "Shower Time Reduction: Limit total shower time to 20 minutes for the week.",
    "Teach Kids: Engage children in one outdoor, eco-friendly activity each day.",
    "Join an Environmental Group: Attend at least one meeting or event.",
    "Support Local Policies: Write to a local representative about an environmental issue.",
    "Carbon Footprint Assessment: Calculate your carbon footprint using an online calculator.",
    "Sustainability Workshop: Attend one workshop (virtual or in-person) on eco-friendly practices.",
    "Reflection Journal: Keep a daily journal for reflections on your sustainable actions.",
    "Zero Waste Challenge: Track and aim to produce as little waste as possible.",
    "Sustainability Discussion: Host a discussion with friends or family about sustainability practices."
  ];
  

const getRandomChallenges = (count) => {
  const shuffled = [...CHALLENGES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const getWeekNumber = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek);
};

const LeaderboardScreen = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserZip, setCurrentUserZip] = useState(null);
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);

  useEffect(() => {
    fetchCurrentUserData();
    fetchWeeklyTasks();
  }, []);

  const fetchWeeklyTasks = async () => {
    const weekNumber = getWeekNumber();
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const tasksDocRef = doc(db, 'weeklyTasks', `week_${weekNumber}`);
      const userProgressRef = doc(db, 'taskProgress', `${userId}_week_${weekNumber}`);
      
      const [tasksDoc, userProgressDoc] = await Promise.all([
        getDoc(tasksDocRef),
        getDoc(userProgressRef)
      ]);

      let tasks;
      if (tasksDoc.exists()) {
        tasks = tasksDoc.data().tasks;
      } else {
        tasks = getRandomChallenges(7);
        await setDoc(tasksDocRef, { tasks });
      }

      setWeeklyTasks(tasks);
      setCompletedTasks(userProgressDoc.exists() ? userProgressDoc.data().completed : []);
    } catch (error) {
      console.error('Error fetching weekly tasks:', error);
    }
  };

  const fetchCurrentUserData = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('Error', 'Please log in to view leaderboard');
        return;
      }

      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const zip = userData.profile?.zipCode;
        setCurrentUserZip(zip);
        setCurrentUser({
          id: userId,
          ...userData,
          score: userData.evaluationResults?.score || 'N/A'
        });
        
        if (zip) {
          fetchUsersInSameZipCode(zip);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to fetch your information');
    }
  };

  const fetchUsersInSameZipCode = async (zipCode) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('profile.zipCode', '==', zipCode));
      const querySnapshot = await getDocs(q);

      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({
          id: doc.id,
          ...doc.data(),
          score: doc.data().evaluationResults?.score || 0
        });
      });

      const sortedUsers = usersData.sort((a, b) => b.score - a.score);
      const rankedUsers = sortedUsers.map((user, index) => ({
        ...user,
        rank: index + 1
      }));

      setUsers(rankedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleTask = async (taskIndex) => {
    const weekNumber = getWeekNumber();
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const wasCompleted = completedTasks.includes(taskIndex);
      const newCompleted = wasCompleted
        ? completedTasks.filter(i => i !== taskIndex)
        : [...completedTasks, taskIndex];

      // Update task progress
      const userProgressRef = doc(db, 'taskProgress', `${userId}_week_${weekNumber}`);
      await setDoc(userProgressRef, { completed: newCompleted }, { merge: true });

      // Update user's score
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const currentScore = userDoc.data()?.evaluationResults?.score || 0;
      
      // Add 0.1 when completing a task, subtract 0.1 when unchecking
      const scoreChange = wasCompleted ? -0.1 : 0.1;
      const newScore = Math.max(0, currentScore + scoreChange);

      await setDoc(userRef, {
        evaluationResults: {
          score: newScore
        }
      }, { merge: true });

      // Update local state
      setCompletedTasks(newCompleted);
      setCurrentUser(prev => ({
        ...prev,
        score: newScore
      }));

      // Refresh the leaderboard to show updated scores
      if (currentUserZip) {
        fetchUsersInSameZipCode(currentUserZip);
      }
    } catch (error) {
      console.error('Error updating task progress and score:', error);
      Alert.alert('Error', 'Failed to update progress');
    }
  };


  const onRefresh = () => {
    setRefreshing(true);
    fetchCurrentUserData();
  };

  const renderUserCard = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankNumber}>#{item.rank}</Text>
      </View>
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle-outline" size={40} color="#007AFF" />
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.profile?.username || 'Anonymous User'}</Text>
          <Text style={styles.userZip}>ZIP Code: {item.profile?.zipCode}</Text>
        </View>
      </View>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Energy Score</Text>
        <Text style={styles.scoreValue}>{item.score.toFixed(1)}</Text>
      </View>
    </View>
  );

  const renderCurrentUserCard = () => {
    if (!currentUser) return null;
    const userRank = users.findIndex(u => u.id === currentUser.id) + 1;
    
    return (
      <View style={styles.currentUserCard}>
        <View style={styles.rankContainer}>
          <Text style={[styles.rankNumber, styles.currentUserRank]}>#{userRank}</Text>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle-outline" size={40} color="#007AFF" />
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.userName, styles.currentUserName]}>
              {currentUser.profile?.name || 'You'} (You)
            </Text>
            <Text style={styles.userZip}>ZIP Code: {currentUser.profile?.zipCode}</Text>
          </View>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Energy Score</Text>
          <Text style={[styles.scoreValue, styles.currentUserScore]}>
            {currentUser.score.toFixed(1)}
          </Text>
        </View>
      </View>
    );
  };

  const renderWeeklyTasks = () => (
    <View style={styles.challengesSection}>
      <Text style={styles.challengesTitle}>Weekly Challenges</Text>
      <Text style={styles.challengesSubtitle}>Complete these tasks to earn points!</Text>
      
      {weeklyTasks.map((task, index) => (
        <TouchableOpacity
          key={index}
          style={styles.taskContainer}
          onPress={() => toggleTask(index)}
        >
          <View style={styles.checkboxContainer}>
            <View style={[
              styles.checkbox,
              completedTasks.includes(index) && styles.checkboxChecked
            ]}>
              {completedTasks.includes(index) && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
          </View>
          <Text style={styles.taskText}>{task}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#007AFF"
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Local Leaderboard</Text>
        <Text style={styles.headerSubtitle}>
          {currentUserZip ? `ZIP Code: ${currentUserZip}` : 'No ZIP code found'}
        </Text>
      </View>

      {renderCurrentUserCard()}

      <FlatList
        data={users}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={60} color="#666" />
            <Text style={styles.emptyText}>No other users found in your area</Text>
          </View>
        }
      />

      {renderWeeklyTasks()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  currentUserCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  userCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentUserRank: {
    color: '#007AFF',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  avatarContainer: {
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  currentUserName: {
    color: '#007AFF',
  },
  userZip: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  scoreContainer: {
    alignItems: 'center',
    minWidth: 80,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 4,
  },
  currentUserScore: {
    fontSize: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  challengesSection: {
    padding: 16,
    backgroundColor: '#1A1A1A',
    marginTop: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  challengesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  challengesSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  taskText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
});

export default LeaderboardScreen;