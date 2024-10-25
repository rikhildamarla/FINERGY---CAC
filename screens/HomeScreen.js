// newsApi.js
const getLocationFromZipCode = (zipCode) => {
    let county, city;
    const params = new URLSearchParams({
        apikey: '318031e0-9239-11ef-8b6d-758c368d52a3',
        codes: zipCode,
        country: "US",
    });
    const url = 'https://app.zipcodebase.com/api/v1/search';
    
    return fetch(`${url}?${params}`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        county = data.results[zipCode][0].province;
        city = data.results[zipCode][0].city;
        return [county, city];
    })
    .catch(error => {
        console.error('Error:', error);
        return ['Unknown', 'Unknown'];
    });
};

const localNews = async (zip, articlesCount) => {
    try {
        const locationData = await getLocationFromZipCode(zip);
        const url = 'https://eventregistry.org/api/v1/article/getArticles';
        const myobj = {
            action: "getArticles",
            keyword: locationData,
            keywordOper: "or",
            lang: "eng",
            ignoreSourceGroupUri: "paywall/paywalled_sources",
            articlesPage: 1,
            articlesCount: articlesCount,
            articlesSortBy: "rel",
            articlesSortByAsc: "false",
            dataType: ["news"],
            forceMaxDataTimeWindow: 31,
            resultType: "articles",
            apiKey: "7217969f-5e7e-4dc5-8121-5abd4869bd70"
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify(myobj)
        });
        const data = await response.json();
        return data.articles.results;
    } catch (error) {
        console.error('Error in localNews:', error);
        return [];
    }
};

const financeNews = async (articlesCount) => {
    try {
        const url = 'https://eventregistry.org/api/v1/article/getArticles';
        const myobj = {
            action: "getArticles",
            keyword: "finance",
            keywordOper: "or",
            lang: "eng",
            ignoreSourceGroupUri: "paywall/paywalled_sources",
            articlesPage: 1,
            articlesCount: articlesCount,
            articlesSortBy: "rel",
            articlesSortByAsc: "false",
            dataType: ["news"],
            forceMaxDataTimeWindow: 31,
            resultType: "articles",
            apiKey: "7217969f-5e7e-4dc5-8121-5abd4869bd70"
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify(myobj)
        });
        const data = await response.json();
        return data.articles.results;
    } catch (error) {
        console.error('Error in financeNews:', error);
        return [];
    }
};

const getLatestArticles = async (numArticles) => {
    try {
        const url = "https://eventregistry.org/api/v1/minuteStreamArticles";
        const myobj = {
            lang: "eng",
            articleBodyLen: 1,
            includeArticleConcepts: true,
            includeArticleCategories: true,
            apiKey: "7217969f-5e7e-4dc5-8121-5abd4869bd70",
            recentActivityArticlesMaxArticleCount: numArticles
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify(myobj)
        });
        const data = await response.json();
        return data.recentActivityArticles.activity;
    } catch (error) {
        console.error('Error in getLatestArticles:', error);
        return [];
    }
};

// HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    SafeAreaView,
    Image,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Platform,
    Linking
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Leaf } from 'lucide-react-native';

const NewsCard = ({ article, onPress }) => (
    <TouchableOpacity 
        style={styles.newsCard}
        onPress={() => article.url && Linking.openURL(article.url)}
    >
        <Image
            source={{ uri: article.image || 'https://via.placeholder.com/400' }}
            style={styles.newsImage}
        />
        <View style={styles.newsContent}>
            <Text style={styles.newsTitle} numberOfLines={2}>
                {article.title}
            </Text>
            <Text style={styles.newsBody} numberOfLines={3}>
                {article.body || article.description || ''}
            </Text>
            <Text style={styles.dateText}>
                {new Date(article.date).toLocaleDateString()}
            </Text>
        </View>
    </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState('trending');
    const [newsData, setNewsData] = useState({
        trending: [],
        local: [],
        finance: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userZipCode, setUserZipCode] = useState('94720');

    useEffect(() => {
        fetchUserData();
        fetchAllNews();
    }, []);

    const fetchUserData = async () => {
        try {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            if (userDoc.exists()) {
                setUserData(userDoc.data());
                if (userDoc.data().zipCode) {
                    setUserZipCode(userDoc.data().zipCode);
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const processArticles = (articles) => {
        return articles.map(article => ({
            id: article.uri || Math.random().toString(),
            title: article.title,
            body: article.body || article.description,
            image: article.image,
            url: article.url,
            date: article.date,
            source: article.source
        }));
    };

    const fetchAllNews = async () => {
        setLoading(true);
        setError(null);
        try {
            const [trendingResults, localResults, financeResults] = await Promise.all([
                getLatestArticles(10),
                localNews(userZipCode, 10),
                financeNews(10)
            ]);

            setNewsData({
                trending: processArticles(trendingResults),
                local: processArticles(localResults),
                finance: processArticles(financeResults)
            });
        } catch (error) {
            console.error('Error fetching news:', error);
            setError('Failed to load news. Pull down to refresh.');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = React.useCallback(() => {
        fetchAllNews();
    }, [userZipCode]);

    const TabButton = ({ title, isActive, onPress }) => (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.tabButton,
                isActive && styles.activeTabButton,
            ]}
        >
            <Text style={[
                styles.tabButtonText,
                isActive && styles.activeTabButtonText
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View>
            <View style={styles.scoreSection}>
                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreTitle}>Your Home Energy Score</Text>
                    <View style={styles.scoreDisplay}>
                        <Text style={styles.score}>
                            {userData?.evaluationResults?.score?.toFixed(1) || '0.0'}
                        </Text>
                        <View style={styles.leafContainer}>
                            <Leaf size={50} color="#4CAF50" />
                            <View 
                                style={[
                                    styles.leafFill,
                                    { height: `${(userData?.evaluationResults?.score * 10) || 0}%` }
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

            <Text style={styles.sectionTitle}>News Overview</Text>
            
            <View style={styles.tabsContainer}>
                <TabButton
                    title="Latest"
                    isActive={activeTab === 'trending'}
                    onPress={() => setActiveTab('trending')}
                />
                <TabButton
                    title="Local"
                    isActive={activeTab === 'local'}
                    onPress={() => setActiveTab('local')}
                />
                <TabButton
                    title="Finance"
                    isActive={activeTab === 'finance'}
                    onPress={() => setActiveTab('finance')}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={newsData[activeTab]}
                numColumns={2}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <NewsCard article={item} />}
                contentContainerStyle={styles.newsGrid}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#4CAF50" />
                        ) : error ? (
                            <Text style={styles.errorText}>{error}</Text>
                        ) : (
                            <Text style={styles.emptyStateText}>No news available</Text>
                        )}
                    </View>
                )}
                refreshing={loading}
                onRefresh={onRefresh}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    tabsContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        paddingHorizontal: 15,
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#1A1A1A',
    },
    activeTabButton: {
        backgroundColor: '#4CAF50',
    },
    tabButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    activeTabButtonText: {
        fontWeight: 'bold',
    },
    newsGrid: {
        padding: 8,
    },
    newsCard: {
        width: (Dimensions.get('window').width - 36) / 2,
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        margin: 8,
        overflow: 'hidden',
    },
    newsImage: {
        width: '100%',
        height: 120,
    },
    newsContent: {
        padding: 12,
    },
    newsTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    newsBody: {
        color: '#999',
        fontSize: 14,
        marginBottom: 8,
    },
    dateText: {
        color: '#666',
        fontSize: 12,
    },
    scoreSection: {
        padding: 20,
        backgroundColor: '#1A1A1A',
        borderRadius: 15,
        margin: 15,
        alignSelf: 'center',
        width: '90%',
        marginLeft: 40,
        marginTop: 6
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
    sectionTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        paddingHorizontal: 15,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    emptyStateText: {
        color: '#666',
        fontSize: 16,
    },
    errorText: {
        color: '#ff4444',
        fontSize: 16,
        textAlign: 'center',
    }
});

export default HomeScreen;