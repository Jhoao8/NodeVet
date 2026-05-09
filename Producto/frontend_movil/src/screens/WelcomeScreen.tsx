import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { globalStyles } from '../style/GlobalStyle'; // <-- Ajusta la ruta si es necesario

const WelcomeScreen = ({ navigation }: any) => {
  return (
    <View style={[globalStyles.container, styles.localContainer]}>
      {/* Área del Logo / Ilustración */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/Logo.png')}
          style={styles.logo}
          resizeMode='contain'  
        />
        <Text style={styles.title}>NodeVet</Text>
        <Text style={styles.subtitle}>Cuidando a los que más quieres</Text>
      </View>

      {/* Botones de Acción */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={globalStyles.primaryButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={globalStyles.primaryButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={globalStyles.primaryButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={globalStyles.primaryButtonText}>Crear Cuenta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  localContainer: {
    padding: spacing.xl,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontFamily: typography.family.main.bold,
    fontSize: 42,
    color: colors.lightYellow,
  },
  subtitle: {
    fontFamily: typography.family.main.regular,
    fontSize: typography.size.md,
    color: colors.lightGreen, 
    marginTop: spacing.xs,
  },
  buttonContainer: {
    gap: spacing.md,
  },
});

export default WelcomeScreen;