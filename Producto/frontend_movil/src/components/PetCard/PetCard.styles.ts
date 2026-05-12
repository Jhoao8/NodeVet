import { colors } from "@/src/theme/colors";
import { typography } from "@/src/theme/typography";
import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get('window');

const cardWidth = (width - 70) / 2; 

export const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    paddingBottom: 10,
    marginBottom: 16, // Espacio hacia abajo
    marginHorizontal: 8, // Espacio hacia los lados
    elevation: 2, 
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1, // Mantiene la caja de la imagen perfectamente cuadrada (1:1)
    overflow: 'hidden', // Evita que la imagen se salga de los bordes redondeados
    marginBottom: 8,
    borderColor: colors.darkDGreen,
    borderWidth: 2,
    backgroundColor: colors.darkGreen,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontFamily: typography.family.main.semiBold,
    color: colors.darkDGreen,
    textAlign: 'center',
    marginBottom: 2,
  },
  gender: {
    fontSize: 14,
    fontFamily: typography.family.main.light,
    color: colors.darkGreen,
    textAlign: 'center',
  },
});