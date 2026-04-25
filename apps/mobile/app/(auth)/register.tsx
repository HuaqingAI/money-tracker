import { Text, TextInput } from '@money-tracker/ui';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { AgreementCheckbox } from '../../components/auth/agreement-checkbox';
import { PhoneAuthForm } from '../../components/auth/phone-auth-form';
import { WechatLoginButton } from '../../components/auth/wechat-login-button';
import { sendOtp, verifyOtp, wechatCallback } from '../../lib/auth-api';
import { useAuthStore } from '../../stores/auth-store';

export default function RegisterScreen() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [loginMethod, setLoginMethod] = useState<'wechat' | 'phone'>('wechat');

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [otpChallengeId, setOtpChallengeId] = useState<string | null>(null);
  const [otpPhone, setOtpPhone] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [wechatLoading, setWechatLoading] = useState(false);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const canSendOtp = useMemo(
    () => /^1[3-9]\d{9}$/.test(phone) && countdown === 0,
    [countdown, phone],
  );
  const canVerifyOtp = useMemo(
    () => /^\d{6}$/.test(code) && otpChallengeId !== null && otpPhone === phone,
    [code, otpChallengeId, otpPhone, phone],
  );

  function handlePhoneChange(value: string) {
    setPhone(value);
    if (otpPhone !== value) {
      setCode('');
      setOtpChallengeId(null);
      setOtpPhone(null);
    }
  }

  async function handleSendOtp() {
    try {
      setSendingOtp(true);
      const result = await sendOtp({ phone });
      setOtpChallengeId(result.challengeId);
      setOtpPhone(phone);
      setCountdown(result.resendAfterSeconds);
      if (result.devCode) {
        setCode(result.devCode);
      }
      Alert.alert(
        '验证码已发送',
        result.devCode
          ? `开发环境验证码：${result.devCode}`
          : '请输入收到的 6 位验证码',
      );
    } catch (error) {
      Alert.alert('发送失败', error instanceof Error ? error.message : '请稍后重试');
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyOtp() {
    try {
      setVerifyingOtp(true);
      const result = await verifyOtp({
        phone,
        challengeId: otpChallengeId ?? undefined,
        code,
        consentAccepted: agreementChecked,
        displayName: displayName.trim() || undefined,
      });
      setSession(result.session);
      router.replace(result.nextPath);
    } catch (error) {
      Alert.alert('验证失败', error instanceof Error ? error.message : '请稍后重试');
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function handleWechatLogin() {
    if (!agreementChecked) {
      Alert.alert('请先同意协议', '继续登录前，请先阅读并同意用户协议和隐私政策');
      return;
    }

    try {
      setWechatLoading(true);
      const result = await wechatCallback({
        code: 'dev-wechat-code',
        consentAccepted: agreementChecked,
      });
      if (!result.featureEnabled) {
        Alert.alert('暂未开放', '微信登录入口已预留，后续会接入原生授权');
        return;
      }

      if (result.session && result.nextPath) {
        setSession(result.session);
        router.replace(result.nextPath);
      }
    } catch (error) {
      Alert.alert('微信登录失败', error instanceof Error ? error.message : '请稍后重试');
    } finally {
      setWechatLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <YStack flex={1} backgroundColor="#FFFFFF">
          <YStack
            paddingTop="$3"
            paddingHorizontal="$4"
            paddingBottom="$6"
            backgroundColor="#E8F5F1"
            borderBottomLeftRadius={32}
            borderBottomRightRadius={32}
          >
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.8)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text fontSize={18} color="$neutral700">‹</Text>
            </Pressable>

            <YStack alignItems="center" gap="$3" marginTop="$4">
              <YStack
                width={56}
                height={56}
                borderRadius={18}
                backgroundColor="$brand500"
                alignItems="center"
                justifyContent="center"
                shadowColor="$brand500"
                shadowOpacity={0.18}
                shadowRadius={16}
                shadowOffset={{ width: 0, height: 8 }}
              >
                <Text color="$surfacePrimary" fontSize={24} fontWeight="700">
                  了
                </Text>
              </YStack>
              <Text variant="caption" color="$neutral500">几秒搞定，马上体验</Text>
            </YStack>
          </YStack>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 32,
              flexGrow: 1,
            }}
          >
            <XStack
              backgroundColor="$neutral100"
              borderRadius="$xl"
              padding="$1"
              gap="$1"
              marginBottom="$5"
            >
              <Pressable
                accessibilityRole="button"
                onPress={() => setLoginMethod('wechat')}
                style={{ flex: 1 }}
              >
                <YStack
                  paddingVertical="$3"
                  borderRadius="$lg"
                  backgroundColor={loginMethod === 'wechat' ? '$surfacePrimary' : 'transparent'}
                  alignItems="center"
                >
                  <Text
                    variant="bodyMedium"
                    color={loginMethod === 'wechat' ? '$neutral800' : '$neutral400'}
                  >
                    微信登录
                  </Text>
                </YStack>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setLoginMethod('phone')}
                style={{ flex: 1 }}
              >
                <YStack
                  paddingVertical="$3"
                  borderRadius="$lg"
                  backgroundColor={loginMethod === 'phone' ? '$surfacePrimary' : 'transparent'}
                  alignItems="center"
                >
                  <Text
                    variant="bodyMedium"
                    color={loginMethod === 'phone' ? '$neutral800' : '$neutral400'}
                  >
                    手机号登录
                  </Text>
                </YStack>
              </Pressable>
            </XStack>

            {loginMethod === 'wechat' ? (
              <YStack gap="$4">
                <YStack
                  backgroundColor="$surfacePrimary"
                  borderRadius="$xl"
                  padding="$5"
                  borderWidth={1}
                  borderColor="$neutral100"
                  shadowColor="#000000"
                  shadowOpacity={0.04}
                  shadowRadius={18}
                  shadowOffset={{ width: 0, height: 6 }}
                >
                  <WechatLoginButton disabled={wechatLoading} onPress={handleWechatLogin} />
                  <Text variant="small" color="$neutral400" textAlign="center" marginTop="$3">
                    将获取您的微信昵称和头像
                  </Text>
                </YStack>
              </YStack>
            ) : (
              <YStack gap="$4">
                <YStack gap="$2">
                  <Text variant="caption">昵称（可选）</Text>
                  <TextInput
                    placeholder="给自己起个称呼"
                    value={displayName}
                    onChangeText={setDisplayName}
                    backgroundColor="$neutral100"
                    borderColor="$neutral300"
                    borderRadius="$xl"
                    height={56}
                    fontSize="$6"
                  />
                </YStack>

                <PhoneAuthForm
                  phone={phone}
                  code={code}
                  countdown={countdown}
                  sendingOtp={sendingOtp}
                  verifyingOtp={verifyingOtp}
                  onPhoneChange={handlePhoneChange}
                  onCodeChange={setCode}
                  onSendOtp={handleSendOtp}
                  onVerifyOtp={handleVerifyOtp}
                  canSendOtp={canSendOtp}
                  canVerifyOtp={canVerifyOtp}
                  otpRequested={otpChallengeId !== null && otpPhone === phone}
                />
              </YStack>
            )}

            <YStack marginTop="auto" paddingTop="$8" gap="$3">
              <XStack alignItems="center" justifyContent="center" gap="$2">
                <Text variant="small" color="$neutral400">🔒</Text>
                <Text variant="small" color="$neutral400">数据加密保护，安全可靠</Text>
              </XStack>

              <AgreementCheckbox
                checked={agreementChecked}
                onToggle={() => setAgreementChecked((value) => !value)}
                onOpenTerms={() => router.push('/(auth)/legal?type=terms')}
                onOpenPrivacy={() => router.push('/(auth)/legal?type=privacy')}
              />
            </YStack>
          </ScrollView>
        </YStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
