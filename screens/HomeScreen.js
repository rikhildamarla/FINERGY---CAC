import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Leaf, Users, TrendingUp, PiggyBank, Settings } from 'lucide-react-native';

const HomeScreen = ({ route, navigation }) => {
  const [userData, setUserData] = useState(null);
  const [newsData, setNewsData] = useState({
    local: [],
    finance: [],
    trending: []
  });

  useEffect(() => {
    fetchUserData();
    fetchNews();
  }, []);

  const fetchUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchNews = async () => {
    //aaravshah fetch logic
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <View style={styles.topBar}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>FINERGY</Text>
          <Text style={styles.subtitle}>CLEAN & GREEN</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Settings size={24} color="#fff" />
        </TouchableOpacity>
      </View> */}

      <ScrollView style={styles.content}>
        <View style={styles.scoreSection}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreTitle}>Your Home Energy Score</Text>
            <View style={styles.scoreDisplay}>
              <Text style={styles.score}>{userData?.evaluationResults.score.toFixed(1)}</Text>
              <View style={styles.leafContainer}>
                <Leaf size={50} color="#4CAF50" />
                <View 
                  style={[
                    styles.leafFill,
                    { height: `${(userData?.evaluationResults.score * 10)}%` }
                  ]} 
                />
              </View>
            </View>
          </View>

          <View style={styles.comparisonContainer}>
            <Text style={styles.comparisonText}>
              California Average: 7.2
            </Text>
            <Text style={styles.savingsText}>
              You could be saving $320 and 12 trees annually
            </Text>
          </View>
        </View>

        <View style={styles.newsSection}>
          <Text style={styles.newsHeader}>Local Environmental & Energy News</Text>
        </View>

        <View style={styles.newsSection}>
          <Text style={styles.newsHeader}>Financial Environmental & Energy News</Text>
        </View>

        <View style={styles.newsSection}>
          <Text style={styles.newsHeader}>Trending Environmental & Energy News</Text>
        </View>
      </ScrollView>

      {/* <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
          <Leaf size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Groups')}>
          <Users size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ESG')}>
          <TrendingUp size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Budget')}>
          <PiggyBank size={24} color="#fff" />
        </TouchableOpacity>
      </View> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#333',
    },
    logo: {
      width: 40,
      height: 40,
      marginRight: 10,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      color: '#fff',
      fontSize: 20,
      fontWeight: 'bold',
    },
    subtitle: {
      color: '#666',
      fontSize: 12,
    },
    content: {
      flex: 1,
    },
    scoreSection: {
      padding: 20,
      backgroundColor: '#1A1A1A',
      borderRadius: 15,
      margin: 15,
    },
    scoreContainer: {
      alignItems: 'center',
    },
    scoreTitle: {
      color: '#fff',
      fontSize: 18,
      marginBottom: 15,
    },
    scoreDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    score: {
      color: '#fff',
      fontSize: 48,
      fontWeight: 'bold',
      marginRight: 20,
    },
    leafContainer: {
      position: 'relative',
    },
    leafFill: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#4CAF50',
      opacity: 0.3,
    },
    comparisonContainer: {
      marginTop: 20,
    },
    comparisonText: {
      color: '#fff',
      fontSize: 16,
      textAlign: 'center',
    },
    savingsText: {
      color: '#4CAF50',
      fontSize: 14,
      textAlign: 'center',
      marginTop: 10,
    },
    newsSection: {
      padding: 15,
    },
    newsHeader: {
      color: '#fff',
      fontSize: 18,
      marginBottom: 15,
    },
    bottomNav: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 15,
      borderTopWidth: 1,
      borderTopColor: '#333',
    },
    navItem: {
      padding: 10,
    },
  });
  
export default HomeScreen;