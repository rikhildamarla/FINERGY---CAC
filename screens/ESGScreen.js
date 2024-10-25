import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import * as FileSystem from 'expo-file-system';

const InfoModal = ({ isVisible, onClose }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>About ESG Scores</Text>
          <Text style={styles.modalText}>
            ESG scores measure a company's performance on Environmental, Social, and Governance factors:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Environmental: Climate change impact, resource use, and pollution</Text>
            <Text style={styles.bulletPoint}>• Social: Labor practices, community relations, and product safety</Text>
            <Text style={styles.bulletPoint}>• Governance: Board composition, business ethics, and transparency</Text>
          </View>
          <Text style={styles.modalText}>
            Scores range from 0-100, with higher scores indicating better ESG performance. Grades (A-F) provide a simplified assessment of these scores.
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const ESGScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [stocksData, setStocksData] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getChartData = (stocks) => {
    // Take up to 5 stocks that have valid total_score values
    const validStocks = stocks
      .slice(0, 5)
      .filter(stock => 
        stock.total_score !== undefined && 
        !isNaN(stock.total_score) && 
        stock.ticker
      );

    console.log('Valid stocks for chart:', validStocks.length);

    if (validStocks.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [0],
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          strokeWidth: 2
        }]
      };
    }

    return {
      labels: validStocks.map(stock => stock.ticker.toUpperCase()),
      datasets: [{
        data: validStocks.map(stock => stock.total_score),
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 2
      }]
    };
  };

  // Function to parse CSV data
  const parseCSV = (csvString) => {
    try {
      const lines = csvString.split('\n');
      const headers = lines[0].split(',');
      
      const parsedData = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',');
          const entry = {};
          headers.forEach((header, index) => {
            const value = values[index]?.trim();
            entry[header.trim()] = /^\d+(\.\d+)?$/.test(value) ? parseFloat(value) : value;
          });
          return entry;
        })
        .filter(entry => 
          entry.total_score !== undefined && 
          !isNaN(entry.total_score) && 
          entry.ticker &&
          entry.name
        );
      
      console.log('Parsed data length:', parsedData.length);
      return parsedData;
    } catch (error) {
      console.error('Error parsing CSV:', error);
      return [];
    }
  };

  // Load CSV data on component mount
  useEffect(() => {
    const loadCSVData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const sampleData = [
            {
              ticker: 'AAPL',
              name: 'Apple Inc',
              total_score: 891,
              total_grade: 'BB',
              environment_grade: 'BB',
              social_grade: 'B',
              governance_grade: 'B',
              environment_score: 355,
              social_score: 281,
              governance_score: 255,
              industry: 'Technology',
              exchange: 'NASDAQ NMS - GLOBAL MARKET',
              currency: 'USD'
            },
            {
              ticker: 'MSFT',
              name: 'Microsoft Corporation',
              total_score: 1255,
              total_grade: 'A',
              environment_grade: 'A',
              social_grade: 'A',
              governance_grade: 'BB',
              environment_score: 560,
              social_score: 450,
              governance_score: 345,
              industry: 'Technology',
              exchange: 'NASDAQ NMS - GLOBAL MARKET',
              currency: 'USD'
            },
            {
              ticker: 'DIS',
              name: 'Walt Disney Co',
              total_score: 1147,
              total_grade: 'BBB',
              environment_grade: 'A',
              social_grade: 'BB',
              governance_grade: 'BB',
              environment_score: 510,
              social_score: 316,
              governance_score: 321,
              industry: 'Media',
              exchange: 'NEW YORK STOCK EXCHANGE, INC.',
              currency: 'USD'
            },
            {
              ticker: 'GM',
              name: 'General Motors Co',
              total_score: 1068,
              total_grade: 'BBB',
              environment_grade: 'A',
              social_grade: 'BB',
              governance_grade: 'B',
              environment_score: 510,
              social_score: 303,
              governance_score: 255,
              industry: 'Automobiles',
              exchange: 'NEW YORK STOCK EXCHANGE, INC.',
              currency: 'USD'
            },
            {
              ticker: 'ABNB',
              name: 'Airbnb Inc',
              total_score: 1475,
              total_grade: 'A',
              environment_grade: 'A',
              social_grade: 'A',
              governance_grade: 'BBB',
              environment_score: 505,
              social_score: 570,
              governance_score: 400,
              industry: 'Hotels Restaurants and Leisure',
              exchange: 'NASDAQ NMS - GLOBAL MARKET',
              currency: 'USD'
            },
            {
              ticker: 'CLX',
              name: 'Clorox Co',
              total_score: 1255,
              total_grade: 'A',
              environment_grade: 'A',
              social_grade: 'BB',
              governance_grade: 'BB',
              environment_score: 560,
              social_score: 350,
              governance_score: 345,
              industry: 'Consumer products',
              exchange: 'NEW YORK STOCK EXCHANGE, INC.',
              currency: 'USD'
            },
            {
              ticker: 'ABMD',
              name: 'ABIOMED Inc',
              total_score: 1129,
              total_grade: 'BBB',
              environment_grade: 'A',
              social_grade: 'BB',
              governance_grade: 'BB',
              environment_score: 500,
              social_score: 324,
              governance_score: 305,
              industry: 'Health Care',
              exchange: 'NASDAQ NMS - GLOBAL MARKET',
              currency: 'USD'
            }
          ];

        const csvPath = FileSystem.documentDirectory + 'data.csv';
        const { exists } = await FileSystem.getInfoAsync(csvPath);
        
        if (exists) {
          const csvContent = await FileSystem.readAsStringAsync(csvPath);
          const parsedData = parseCSV(csvContent);
          console.log('Loaded data length:', parsedData.length);
          setStocksData(parsedData);
          setFilteredStocks(parsedData);
        } else {
          console.log('Using sample data');
          setStocksData(sampleData);
          setFilteredStocks(sampleData);
        }
      } catch (error) {
        console.error('Error loading CSV:', error);
        setError('Failed to load data');
        setStocksData([]);
        setFilteredStocks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCSVData();
  }, []);

  // Filter stocks based on search term
  useEffect(() => {
    console.log('Filtering with search term:', searchTerm);
    console.log('Current stocks data length:', stocksData.length);
    
    if (searchTerm.trim() === '') {
      setFilteredStocks(stocksData);
    } else {
      const searchTermLower = searchTerm.toLowerCase().trim();
      const filtered = stocksData.filter(stock => 
        (stock.ticker && stock.ticker.toLowerCase().includes(searchTermLower)) ||
        (stock.name && stock.name.toLowerCase().includes(searchTermLower))
      );
      console.log('Filtered results:', filtered.length);
      setFilteredStocks(filtered);
    }
  }, [searchTerm, stocksData]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search stocks..."
              placeholderTextColor="#666"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => setInfoModalVisible(true)}
            >
              <Text style={styles.infoButtonText}>ⓘ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        {error && (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!isLoading && !error && filteredStocks.length === 0 && (
          <View style={styles.centerContainer}>
            <Text style={styles.noResultsText}>No stocks found</Text>
          </View>
        )}

        {!isLoading && !error && filteredStocks.length > 0 && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ESG Analysis</Text>
              <Text style={styles.sectionSubtitle}>Performance metrics across Environmental, Social, and Governance factors</Text>
              <LineChart
                data={getChartData(filteredStocks)}
                width={Dimensions.get('window').width - 40}
                height={220}
                chartConfig={{
                  backgroundColor: '#1e1e1e',
                  backgroundGradientFrom: '#1e1e1e',
                  backgroundGradientTo: '#1e1e1e',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  formatYLabel: (value) => Math.round(value).toString()
                }}
                bezier
                style={styles.chart}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ESG Stocks</Text>
              <Text style={styles.sectionSubtitle}>Companies based on ESG criteria</Text>
              {filteredStocks.slice(0, 5).map((stock) => (
                <View key={stock.ticker} style={styles.stockCard}>
                  <View style={styles.stockHeader}>
                    <Text style={styles.stockTicker}>{stock.ticker.toUpperCase()}</Text>
                    <Text style={styles.stockName}>{stock.name}</Text>
                  </View>
                  <View style={styles.stockDetails}>
                    <View style={styles.stockMetric}>
                      <Text style={styles.metricLabel}>Total Grade:</Text>
                      <Text style={styles.metricValue}>{stock.total_grade}</Text>
                    </View>
                    <View style={styles.stockMetric}>
                      <Text style={styles.metricLabel}>Environmental:</Text>
                      <Text style={styles.metricValue}>{stock.environment_grade}</Text>
                    </View>
                    <View style={styles.stockMetric}>
                      <Text style={styles.metricLabel}>Social:</Text>
                      <Text style={styles.metricValue}>{stock.social_grade}</Text>
                    </View>
                    <View style={styles.stockMetric}>
                      <Text style={styles.metricLabel}>ESG Score:</Text>
                      <Text style={styles.metricValue}>{Math.round(stock.total_score)}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
        
        <InfoModal 
          isVisible={infoModalVisible} 
          onClose={() => setInfoModalVisible(false)} 
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
  },
  noResultsText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },    
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    paddingHorizontal: 15,
    color: '#fff',
  },
  infoButton: {
    width: 40,
    height: 40,
    backgroundColor: '#333',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#666',
    fontSize: 14,
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  stockCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  stockHeader: {
    marginBottom: 12,
  },
  stockTicker: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stockName: {
    color: '#666',
    fontSize: 14,
  },
  stockDetails: {
    gap: 8,
  },
  stockMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: '#666',
  },
  metricValue: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    color: '#fff',
    marginBottom: 12,
  },
  bulletPoints: {
    marginBottom: 16,
  },
  bulletPoint: {
    color: '#fff',
    marginBottom: 8,
  },
  closeButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ESGScreen;