import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';

interface ButtonProps {
title: string;
onPress: () => void;
variant?: 'primary' | 'secondary' | 'danger';
disabled?: boolean;
loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
title,
onPress,
variant = 'primary',
disabled = false,
loading = false,
}) => {
return (
  <TouchableOpacity
    style={[
      styles.button,
      styles[variant],
      (disabled || loading) && styles.disabled,
    ]}
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.7}
  >
    {loading ? (
      <ActivityIndicator color="#fff" size="small" />
    ) : (
      <Text style={styles.text}>{title}</Text>
    )}
  </TouchableOpacity>
);
};

const styles = StyleSheet.create({
button: {
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  marginVertical: 8,
},
primary: {
  backgroundColor: '#007AFF',
},
secondary: {
  backgroundColor: '#E5E5EA',
},
danger: {
  backgroundColor: '#b0231c',
},
disabled: {
  opacity: 0.5,
},
text: {
  fontSize: 16,
  fontWeight: '600',
  color: '#fff',
},
});

export default Button;