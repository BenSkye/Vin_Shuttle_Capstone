import { SafeAreaView } from 'react-native';

export const Container = ({ children }: { children: React.ReactNode }) => {
  return <SafeAreaView className="m-6 flex flex-1">{children}</SafeAreaView>;
};

const styles = {
  container: 'flex flex-1 m-6',
};
