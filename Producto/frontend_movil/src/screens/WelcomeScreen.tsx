import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const WelcomeScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      {/* Área del Logo / Ilustración */}
      <View style={styles.logoContainer}>
        <Image
      source={require('../../assets/images/Logo.png')}                        // Logo temporal
      style={styles.logo}
      resizeMode='contain'  
        />
        <Text style={styles.title}>NodeVet</Text>
        <Text style={styles.subtitle}>Cuidando a los que más quieres</Text>
    </View>

      {/* Botones de Acción */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.primaryButtonText}>Crear Cuenta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkDGreen,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    width: 150,  // Ajusta el tamaño según el diseño
    height: 150,
    //marginBottom: spacing.md // Deja un espacio entre el logo y el título
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
  primaryButton: {
    backgroundColor: colors.lightGreen,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3, // Sombras en Android
  },
  primaryButtonText: {
    fontFamily: typography.family.main.semiBold,
    color: colors.darkDGreen,
    fontSize: typography.size.md,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: colors.lightGreen,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: typography.family.main.semiBold,
    color: colors.lightGreen,
    fontSize: typography.size.md,
  },
});

export default WelcomeScreen;