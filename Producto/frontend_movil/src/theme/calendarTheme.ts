import { colors } from './colors';
import { typography } from './typography';

export const customCalendarTheme = {
    backgroundColor: colors.white,
    calendarBackground: colors.white,
    textSectionTitleColor: colors.darkGreen,
    selectedDayBackgroundColor: colors.darkGreen, 
    selectedDayTextColor: colors.lightYellow,
    todayTextColor: colors.darkGreen,
    dayTextColor: colors.darkDGreen,
    textDisabledColor: '#D1D5DB', // Gris para días pasados o inactivos
    arrowColor: colors.darkGreen, 
    monthTextColor: colors.darkDGreen,
    textDayFontFamily: typography.family.main.regular,
    textMonthFontFamily: typography.family.main.bold,
    textDayHeaderFontFamily: typography.family.main.semiBold,
    textMonthFontSize: typography.size.md,
};