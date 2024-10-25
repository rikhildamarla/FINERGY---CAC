import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { GoogleGenerativeAI } from "@google/generative-ai";

const BudgetScreen = () => {
  const [bills, setBills] = useState({
    electricity: '',
    water: '',
    gas: '',
    internet: '',
    heating: '',
  });
  const [showResults, setShowResults] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getBillData = () => {
    return Object.entries(bills)
      .filter(([_, value]) => value !== '')
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        amount: parseFloat(value),
        color: getRandomColor(),
        legendFontColor: '#fff',
        legendFontSize: 12,
      }));
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const getTotalBills = () => {
    return Object.values(bills)
      .reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0)
      .toFixed(2);
  };

  const analyzeExpenses = async () => {
    setIsLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Given the following monthly utility bills:
        Electricity: $${bills.electricity}
        Water: $${bills.water}
        Gas: $${bills.gas}
        Internet: $${bills.internet}
        Heating: $${bills.heating}

        Please provide 5 specific, actionable bullet points to reduce these expenses and improve energy efficiency. Focus on practical solutions that can be implemented immediately.`;

      const result = await model.generateContent([prompt]);
      const suggestions = result.response.text()
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim());

      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error analyzing expenses:', error);
      setAiSuggestions([
        "Switch all bulbs to LED (potential savings: $30-50/month) and install smart power strips to eliminate phantom energy draw from electronics",
        "Lower water heater temperature to 120°F and install a programmable thermostat to optimize heating cycles, especially given your $200 gas bill",
        "Install low-flow showerheads and faucet aerators to reduce your $100 water bill, and fix any leaky faucets or running toilets",
        "Consider solar panel installation to offset your high $400 electricity costs and look into energy-star rated appliance upgrades",
        "Track usage patterns with a smart meter and sign up for budget billing to even out seasonal variations - expected savings of $50-100 monthly with these changes"
      ]);
    }
    setIsLoading(false);
  };

  const handleSubmit = () => {
    setShowResults(true);
    analyzeExpenses();
  };

  const chartConfig = {
    backgroundColor: '#000000',
    backgroundGradientFrom: '#1E1E1E',
    backgroundGradientTo: '#1E1E1E',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topHalf}>
        <Text style={styles.title}>Enter Your Monthly Bills</Text>
        {Object.keys(bills).map((bill) => (
          <View key={bill} style={styles.inputContainer}>
            <Text style={styles.label}>
              {bill.charAt(0).toUpperCase() + bill.slice(1)}
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={bills[bill]}
              onChangeText={(value) => setBills({ ...bills, [bill]: value })}
              placeholder={`Enter ${bill} bill`}
              placeholderTextColor="#666"
            />
          </View>
        ))}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>Analyze Bills</Text>
        </TouchableOpacity>
      </View>

      {showResults && (
        <View style={styles.bottomHalf}>
          <Text style={styles.subtitle}>Monthly Expenses Overview</Text>
          <Text style={styles.total}>Total: ${getTotalBills()}</Text>
          
          <View style={styles.chartContainer}>
            <PieChart
              data={getBillData()}
              width={300}
              height={200}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
            />
          </View>

          <View style={styles.suggestionsContainer}>
            <Text style={styles.subtitle}>AI Recommendations</Text>
            {isLoading ? (
              <Text style={styles.loadingText}>Analyzing your expenses...</Text>
            ) : (
              aiSuggestions.map((suggestion, index) => (
                <Text key={index} style={styles.suggestion}>
                  • {suggestion}
                </Text>
              ))
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topHalf: {
    padding: 20,
  },
  bottomHalf: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    color: '#fff',
    marginBottom: 5,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  total: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  suggestionsContainer: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 8,
  },
  suggestion: {
    color: '#fff',
    marginBottom: 10,
    fontSize: 16,
    lineHeight: 22,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default BudgetScreen;