import { fontSize } from '@/constants/text';
import { genreIconData } from '@/hooks/cache/use-icon-images';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useCallback } from 'react';
import { I18nManager, StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const ICON_COLOR = '#424242';

export const SelectGenre = ({ value, onChange, placeholder = 'Select genre' }) => {
  const renderLeftIcon = useCallback(() => {
    if (value == null || value === '') return null;
    const row = genreIconData.find((g) => g.value === value);
    if (!row) return null;
    return (
      <MaterialCommunityIcons
        name={row.icon}
        size={24}
        color={ICON_COLOR}
        style={styles.leftIcon}
      />
    );
  }, [value]);

  const renderItem = useCallback((item: (typeof genreIconData)[number], _selected?: boolean) => {
    return (
      <View style={[styles.itemRow, I18nManager.isRTL && styles.itemRowRtl]}>
        <MaterialCommunityIcons name={item.icon} size={24} color={ICON_COLOR} />
        <Text style={styles.itemLabel}>{item.lable}</Text>
      </View>
    );
  }, []);

  return (
    <Dropdown
      style={[styles.dropdown, { borderRadius: 18 }]}
      selectedTextStyle={styles.selectedTextStyle}
      placeholderStyle={[styles.placeholderStyle, { marginLeft: 6 }]}
      itemTextStyle={styles.itemLabel}
      iconStyle={styles.iconStyle}
      maxHeight={200}
      value={value}
      data={genreIconData}
      valueField="value"
      labelField="lable"
      placeholder={placeholder}
      onChange={(item) => onChange(item.value)}
      renderLeftIcon={renderLeftIcon}
      renderItem={renderItem}
      containerStyle={{ borderRadius: 22 }}
      itemContainerStyle={{ borderRadius: 12 }}
    />
  );
};

export default SelectGenre;

const styles = StyleSheet.create({
  dropdown: {
    marginVertical: 8,
    marginRight: 8,
    marginLeft: 0,
    height: 42,
    minWidth: 180,
    backgroundColor: 'white',
    borderRadius: 18,
    paddingHorizontal: 10,
    alignItems: 'flex-start',
  },
  leftIcon: {
    marginEnd: 6,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  itemRowRtl: {
    flexDirection: 'row-reverse',
  },
  itemLabel: {
    flex: 1,
    fontSize: fontSize.button,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  placeholderStyle: {
    fontSize: fontSize.button,
  },
  selectedTextStyle: {
    fontSize: fontSize.button,
    marginLeft: 8,
  },
  iconStyle: {
    width: 22,
    height: 22,
  },
});
