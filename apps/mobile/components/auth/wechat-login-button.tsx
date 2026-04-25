import { Button, Text } from '@money-tracker/ui';
import { XStack } from 'tamagui';

interface WechatLoginButtonProps {
  disabled?: boolean;
  onPress: () => void;
}

export function WechatLoginButton({
  disabled = false,
  onPress,
}: WechatLoginButtonProps) {
  return (
    <Button
      height={56}
      borderRadius="$xl"
      backgroundColor="#07C160"
      pressStyle={{ backgroundColor: '#059b4d', scale: 0.97 }}
      disabled={disabled}
      onPress={onPress}
      shadowColor="#07C160"
      shadowOpacity={0.18}
      shadowRadius={16}
      shadowOffset={{ width: 0, height: 8 }}
    >
      <XStack alignItems="center" gap="$2">
        <Text color="$surfacePrimary" fontSize={20} fontWeight="700">
          微
        </Text>
        <Text color="$surfacePrimary" fontSize={17} fontWeight="700">
          微信一键登录
        </Text>
      </XStack>
    </Button>
  );
}
