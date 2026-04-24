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
      backgroundColor="#07C160"
      pressStyle={{ backgroundColor: '#059b4d', scale: 0.97 }}
      disabled={disabled}
      onPress={onPress}
    >
      <XStack alignItems="center" gap="$2">
        <Text color="$surfacePrimary">微</Text>
        <Text color="$surfacePrimary">微信一键登录</Text>
      </XStack>
    </Button>
  );
}
