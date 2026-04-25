import { Button, Text, TextInput } from '@money-tracker/ui';
import { YStack } from 'tamagui';

interface PhoneAuthFormProps {
  phone: string;
  code: string;
  countdown: number;
  sendingOtp: boolean;
  verifyingOtp: boolean;
  onPhoneChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
  canSendOtp: boolean;
  canVerifyOtp: boolean;
}

export function PhoneAuthForm({
  phone,
  code,
  countdown,
  sendingOtp,
  verifyingOtp,
  onPhoneChange,
  onCodeChange,
  onSendOtp,
  onVerifyOtp,
  canSendOtp,
  canVerifyOtp,
}: PhoneAuthFormProps) {
  const otpRequested = countdown > 0 || code.length > 0;

  return (
    <YStack gap="$4">
      <YStack gap="$3">
        <YStack
          borderWidth={1}
          borderColor="$neutral300"
          borderRadius="$xl"
          backgroundColor="$neutral100"
          paddingHorizontal="$4"
          paddingVertical="$3"
          gap="$2"
        >
          <Text variant="bodyMedium" color="$neutral500">
            +86
          </Text>
          <TextInput
            keyboardType="number-pad"
            maxLength={11}
            placeholder="输入手机号"
            value={phone}
            onChangeText={onPhoneChange}
            backgroundColor="$surfacePrimary"
            borderColor="$neutral200"
            borderRadius="$xl"
            height={56}
            fontSize="$6"
          />
        </YStack>
      </YStack>

      <Button
        disabled={!canSendOtp || sendingOtp}
        onPress={onSendOtp}
        borderRadius="$xl"
        height={56}
        backgroundColor={canSendOtp && !sendingOtp ? '$brand500' : '#C9CBF8'}
        pressStyle={{
          backgroundColor: '$brand600',
          scale: 0.98,
        }}
      >
        {sendingOtp
          ? '发送中...'
          : countdown > 0
            ? `重新获取(${countdown}s)`
            : '获取验证码'}
      </Button>

      {otpRequested ? (
        <YStack gap="$3">
          <TextInput
            keyboardType="number-pad"
            maxLength={6}
            placeholder="输入 6 位验证码"
            value={code}
            onChangeText={onCodeChange}
            backgroundColor="$surfacePrimary"
            borderColor="$neutral300"
            borderRadius="$xl"
            height={56}
            fontSize="$6"
          />
          <Button
            disabled={!canVerifyOtp || verifyingOtp}
            onPress={onVerifyOtp}
            borderRadius="$xl"
            height={56}
          >
            {verifyingOtp ? '验证中...' : '登录 / 注册'}
          </Button>
        </YStack>
      ) : null}
    </YStack>
  );
}
