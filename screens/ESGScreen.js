import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ESGScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>ESG Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default ESGScreen;
