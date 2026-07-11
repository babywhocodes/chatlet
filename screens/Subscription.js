import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { AntDesign, FontAwesome } from '@expo/vector-icons';

export default function Subscription({ navigation }) {
  const [selectedPlan, setSelectedPlan] = useState('monthly'); // default to monthly

  return (
    <>
      <ImageBackground
        style={styles.container}
        resizeMode="cover"
        source={require('../assets/whipurp.jpg')}
      >
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <AntDesign name="close" size={34} color="#ffffff" style={styles.close} />
        </TouchableOpacity>

        <Text style={styles.premium}>Upgrade to Premium</Text>

        <View style={styles.subs}>
          {/* Monthly Plan */}
          <TouchableOpacity 
            style={[
              styles.planBox, 
              selectedPlan === 'monthly' ? styles.selected : styles.notSelected
            ]}
            onPress={() => setSelectedPlan('monthly')}
          >
            {/* Green Check Icon */}
            {selectedPlan === 'monthly' && (
              <FontAwesome 
                name="check-circle" 
                size={26} 
                color="green" 
                style={styles.checkIcon} 
              />
            )}
            <Text style={[
              styles.planText, 
              selectedPlan === 'monthly' ? styles.selectedText : styles.notSelectedText
            ]}>
              Monthly
            </Text>
            <Text style={[
              styles.price, 
              selectedPlan === 'monthly' ? styles.selectedText : styles.notSelectedText
            ]}>
              $ 4.99
            </Text>
            <Text style={[
              styles.timemonthly, 
              selectedPlan === 'monthly' ? styles.selectedText : styles.notSelectedText
            ]}>
              Billed Monthly
            </Text>
          </TouchableOpacity>

          {/* Annual Plan */}
          <TouchableOpacity 
            style={[
              styles.planBox, 
              selectedPlan === 'annual' ? styles.selected : styles.notSelected
            ]}
            onPress={() => setSelectedPlan('annual')}
          >
            {/* Green Check Icon */}
            {selectedPlan === 'annual' && (
              <FontAwesome 
                name="check-circle" 
                size={26} 
                color="green" 
                style={styles.checkIcon} 
              />
            )}
            <Text style={[
              styles.planText, 
              selectedPlan === 'annual' ? styles.selectedText : styles.notSelectedText
            ]}>
              Annually
            </Text>
            <Text style={[
              styles.price, 
              selectedPlan === 'annual' ? styles.selectedText : styles.notSelectedText
            ]}>
              $ 35.99
            </Text>
            <Text style={styles.save}>save 40%</Text>
            <Text style={[
              styles.timeannual, 
              selectedPlan === 'annual' ? styles.selectedText : styles.notSelectedText
            ]}>
              Billed Annually
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.benefits}>
          <Text style={styles.benefitstext}>✔ Unlimited Set of flashcards</Text>
          <Text style={styles.benefitstext}>✔ Up to 20 flashcards in one Set</Text>
          <Text style={styles.benefitstext}>✔ Ad Free Experience</Text>
          <Text style={styles.benefitstext}>✔ Sync across all your devices</Text>
          <Text style={styles.benefitstext}>✔ Early access to new features</Text>
          <Text style={styles.benefitstext}>✔ Priority customer support</Text>
        </View>

        <TouchableOpacity 
          style={styles.subscribeButton} 
          onPress={() => {
            
          }}
        >
          <Text style={styles.subscribe}>
            {selectedPlan === 'monthly' ? "Subscribe Monthly" : "Subscribe Annually"}
          </Text>
        </TouchableOpacity>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  close: {
    padding: 10,
  },
  premium: {
    fontFamily: 'jaro',
    marginTop: 15,
    fontSize: 32.5,
    textAlign: 'center',
    color: '#ffffff',
  },
  subs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  planBox: {
    height: '82%',
    width: '47%',
    margin: 5,
    borderRadius: 20,
    padding: 15,
    borderWidth: 4,
    position: 'relative', // needed for absolute icon
  },
  selected: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  notSelected: {
    backgroundColor: 'transparent',
    borderColor: '#ffffff',
  },
  planText: {
    fontWeight: '900',
    fontFamily: 'jaro',
    fontSize: 20,
  },
  selectedText: {
    color: 'black',
  },
  notSelectedText: {
    color: 'white',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },  
  benefitstext: {
    marginTop: 8,
    color: 'white',
    fontWeight: '900',
    fontFamily: 'jaro',
    fontSize: 20.5,
  },
  price: {
    fontWeight: '500',
    fontFamily: 'jaro',
    fontSize: 21,
    paddingTop: 1,
  },
  timemonthly: {
    marginTop: 39,
    fontSize: 17,
    marginBottom:5
  },
  timeannual: {
    marginTop: 8,
    fontSize: 17,
    marginBottom:8
  },
  save: {
    backgroundColor: 'white',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
    fontWeight: '500',
    alignSelf: 'flex-start',
    fontFamily: 'jaro',
    marginTop: 8,
  },
  benefits: {
    margin: 10,
  },
  subscribeButton: {
    margin: 20,
    marginTop: 65,
    marginBottom: 85,
    borderRadius: 15,
    padding: 10,
    backgroundColor: 'black',
  },
  subscribe: {
    fontFamily: 'jaro',
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
  },
});
