import type { FC } from 'react';
import { View, Text } from 'react-native';

const TotalCompra: FC<{ total: number }> = ({ total }) => (
  <View className="items-end mt-4">
    <Text className="text-xl text-gray-700">
      <Text className="font-bold">Total:</Text> {total.toLocaleString()} Gs
    </Text>
  </View>
);

export default TotalCompra;
