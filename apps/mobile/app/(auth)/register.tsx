import { Text, TextInput } from '@money-tracker/ui';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Linking, Platform } from 'react-native';
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

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
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
    () => /^\d{6}$/.test(code),
    [code],
  );

  async function handleSendOtp() {
    try {
      setSendingOtp(true);
      const result = await sendOtp({ phone });
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
    try {
      setWechatLoading(true);
      const result = await wechatCallback({ code: 'dev-wechat-code' });
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
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <YStack
          flex={1}
          backgroundColor="$surfacePage"
          paddingHorizontal="$4"
          paddingVertical="$5"
          gap="$5"
        >
          <YStack gap="$2">
            <Text variant="h1">快速注册 / 登录</Text>
            <Text variant="caption">几秒搞定，马上开始体验零输入记账</Text>
          </YStack>

          <WechatLoginButton disabled={wechatLoading} onPress={handleWechatLogin} />

          <XStack ai="center" gap="$3">
            <YStack flex={1} h={1} bg="$neutral200" />
            <Text variant="caption">或使用手机号</Text>
            <YStack flex={1} h={1} bg="$neutral200" />
          </XStack>

          <YStack gap="$2">
            <Text variant="caption">昵称（可选）</Text>
            <TextInput
              placeholder="给自己起个称呼"
              value={displayName}
              onChangeText={setDisplayName}
            />
          </YStack>

          <PhoneAuthForm
            phone={phone}
            code={code}
            countdown={countdown}
            sendingOtp={sendingOtp}
            verifyingOtp={verifyingOtp}
            onPhoneChange={setPhone}
            onCodeChange={setCode}
            onSendOtp={handleSendOtp}
            onVerifyOtp={handleVerifyOtp}
            canSendOtp={canSendOtp}
            canVerifyOtp={canVerifyOtp}
          />

          <AgreementCheckbox
            checked={agreementChecked}
            onToggle={() => setAgreementChecked((value) => !value)}
            onOpenTerms={() =>
              void Linking.openURL('https://example.com/terms').catch(() => {
                Alert.alert('提示', '用户协议链接待补充');
              })
            }
            onOpenPrivacy={() =>
              void Linking.openURL('https://example.com/privacy').catch(() => {
                Alert.alert('提示', '隐私政策链接待补充');
              })
            }
          />
        </YStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
