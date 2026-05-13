import { StyleSheet } from 'react-native';
import { spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
    container: {
        maxHeight: 220, // Altura clave para que el scroll interno funcione sin romper el Home
        width: '100%',
    },
    loaderContainer: {
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    }
});