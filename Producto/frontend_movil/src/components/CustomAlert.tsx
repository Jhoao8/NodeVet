import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertState {
    visible: boolean;
    title: string;
    message: string;
    buttons: AlertButton[];
}

export const useCustomAlert = () => {
    const [alertState, setAlertState] = useState<CustomAlertState>({
        visible: false,
        title: '',
        message: '',
        buttons: [],
    });

    const showAlert = (
        title: string,
        message: string,
        buttons: AlertButton[] = [{ text: 'OK', style: 'default' }]
    ) => {
        setAlertState({
            visible: true,
            title,
            message,
            buttons,
        });
    };

    const hideAlert = () => {
        setAlertState((prev) => ({ ...prev, visible: false }));
    };

    const handleButtonPress = (button: AlertButton) => {
        if (button.onPress) {
            button.onPress();
        }
        hideAlert();
    };

    const AlertComponent = () => (
        <Modal
            visible={alertState.visible}
            transparent
            animationType="fade"
            onRequestClose={hideAlert}
        >
            <View style={styles.overlay}>
                <View style={styles.alertContainer}>
                    {/* Título */}
                    <Text style={styles.title}>{alertState.title}</Text>

                    {/* Mensaje */}
                    <Text style={styles.message}>{alertState.message}</Text>

                    {/* Botones */}
                    <View style={styles.buttonsContainer}>
                        {alertState.buttons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.button,
                                    button.style === 'cancel' && styles.buttonCancel,
                                    button.style === 'destructive' && styles.buttonDestructive,
                                    index < alertState.buttons.length - 1 && styles.buttonBorder,
                                ]}
                                onPress={() => handleButtonPress(button)}
                            >
                                <Text
                                    style={[
                                        styles.buttonText,
                                        button.style === 'destructive' && styles.buttonTextDestructive,
                                    ]}
                                >
                                    {button.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );

    return { showAlert, AlertComponent };
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContainer: {
        backgroundColor: colors.lightYellow,
        borderRadius: 12,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: 0,
        width: '85%',
        maxWidth: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontFamily: typography.family.main.bold,
        fontSize: typography.size.lg,
        color: colors.darkDGreen,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    message: {
        fontFamily: typography.family.main.regular,
        fontSize: typography.size.md,
        color: colors.darkGreen,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    buttonsContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: colors.darkGreen + '20',
    },
    button: {
        flex: 1,
        paddingVertical: spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonBorder: {
        borderRightWidth: 1,
        borderRightColor: colors.darkGreen + '20',
    },
    buttonCancel: {},
    buttonDestructive: {},
    buttonText: {
        fontFamily: typography.family.main.semiBold,
        fontSize: typography.size.md,
        color: colors.darkGreen,
    },
    buttonTextDestructive: {
        color: '#E74C3C',
    },
});
