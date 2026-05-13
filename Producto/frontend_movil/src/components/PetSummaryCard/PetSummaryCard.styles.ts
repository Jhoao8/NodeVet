import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGreen,
    },
    leftSection: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: spacing.md,
        backgroundColor: colors.lightYellow,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: spacing.md,
        backgroundColor: colors.lightGreen,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nameText: {
        fontFamily: typography.family.main.semiBold,
        fontSize: typography.size.md,
        color: colors.darkDGreen,
        flexShrink: 1,
    },
    verticalDivider: {
        height: '70%',
        width: 1,
        backgroundColor: colors.lightGreen,
        marginHorizontal: spacing.md,
    },
    rightSection: {
        flex: 1,
        alignItems: 'center',
    },
    dateText: {
        fontFamily: typography.family.main.regular,
        fontSize: typography.size.sm,
        color: colors.darkGreen,
        textAlign: 'center',
    },
});