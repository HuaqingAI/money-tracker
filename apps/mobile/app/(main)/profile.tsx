import type { UserGender } from '@money-tracker/shared';
import { Button, Text, TextInput } from '@money-tracker/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { YStack } from 'tamagui';

import {
  ApiClientError,
  deleteAccount,
  fetchUserProfile,
  updateProfile,
} from '../../lib/api-client';
import { clearClientSession } from '../../lib/session';
import { useAuthStore } from '../../stores/auth-store';

const brand = '#1A6B5A';
const brandAccent = '#47AF8F';
const brandLight = '#D1EBE3';
const page = '#F9FAFB';
const border = '#F3F4F6';
const text = '#111827';
const muted = '#9CA3AF';

type ProfileSheetMode = 'nickname' | 'gender' | 'birthday' | null;

const genderOptions: ReadonlyArray<{ label: string; value: UserGender }> = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '不愿透露', value: 'undisclosed' },
];
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1;
const currentDay = today.getDate();
const yearOptions = Array.from({ length: 91 }, (_, index) => String(currentYear - index));

function padDatePart(value: number): string {
  return String(value).padStart(2, '0');
}

function getMonthOptions(year: string): string[] {
  const maxMonth = Number(year) >= currentYear ? currentMonth : 12;
  return Array.from({ length: maxMonth }, (_, index) => padDatePart(index + 1));
}

function getDayOptions(year: string, month: string): string[] {
  const maxCalendarDay = new Date(Number(year), Number(month), 0).getDate();
  const maxDay =
    Number(year) >= currentYear && Number(month) >= currentMonth
      ? Math.min(maxCalendarDay, currentDay)
      : maxCalendarDay;
  return Array.from({ length: maxDay }, (_, index) => padDatePart(index + 1));
}

function SectionHeader({ children }: { children: string }) {
  return <Text style={styles.sectionHeader}>{children}</Text>;
}

function ListGroup({ children }: { children: ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

function Row({
  label,
  detail,
  onPress,
  destructive = false,
  withBorder = true,
}: {
  label: string;
  detail?: string;
  onPress?: () => void;
  destructive?: boolean;
  withBorder?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        withBorder ? styles.rowBorder : null,
        pressed && onPress ? styles.rowPressed : null,
      ]}
    >
      <Text style={[styles.rowLabel, destructive ? styles.destructive : null]}>
        {label}
      </Text>
      {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
      {onPress ? <Text style={styles.chevron}>{'>'}</Text> : null}
    </Pressable>
  );
}

function getAvatarLabel(nickname: string): string {
  const trimmed = nickname.trim();
  return (trimmed.charAt(trimmed.length - 1) || '我').toUpperCase();
}

function normalizeAvatarUri(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function formatLoginMethod(value: string | null | undefined): string {
  if (value === 'wechat') {
    return '微信登录';
  }

  if (value === 'phone') {
    return '验证码登录';
  }

  return '未识别';
}

function formatGender(value: UserGender | null | undefined): string {
  return genderOptions.find((option) => option.value === value)?.label ?? '暂未设置';
}

export default function ProfileScreen() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const summary = useAuthStore((state) => state.user);
  const setUserProfile = useAuthStore((state) => state.setUserProfile);
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    enabled: !!accessToken,
    queryFn: () => fetchUserProfile(accessToken as string),
    queryKey: ['user-profile'],
  });

  const [nicknameDraft, setNicknameDraft] = useState<string | null>(null);
  const [nicknameInput, setNicknameInput] = useState('');
  const [profileSheetMode, setProfileSheetMode] = useState<ProfileSheetMode>(null);
  const [avatarUriDraft, setAvatarUriDraft] = useState<string | null>(null);
  const [genderDraft, setGenderDraft] = useState<UserGender | null | undefined>(undefined);
  const [birthday, setBirthday] = useState<string | null>(null);
  const [birthYear, setBirthYear] = useState('1996');
  const [birthMonth, setBirthMonth] = useState('03');
  const [birthDay, setBirthDay] = useState('15');

  const originalNickname = profileQuery.data?.nickname ?? summary.nickname ?? '';
  const originalAvatarUri = profileQuery.data?.avatarUrl ?? summary.avatarUrl ?? null;
  const originalGender = profileQuery.data?.gender ?? null;
  const originalBirthday = profileQuery.data?.birthday ?? null;
  const nickname = nicknameDraft ?? originalNickname;
  const trimmedNickname = nickname.trim();
  const avatarUri = normalizeAvatarUri(avatarUriDraft ?? originalAvatarUri);
  const gender = genderDraft === undefined ? originalGender : genderDraft;
  const effectiveBirthday = birthday ?? originalBirthday;
  const avatarLabel = useMemo(
    () => getAvatarLabel(trimmedNickname || originalNickname),
    [originalNickname, trimmedNickname],
  );
  const originalComparableNickname = originalNickname.trim();
  const originalComparableAvatarUri = normalizeAvatarUri(originalAvatarUri);
  const hasChanges =
    trimmedNickname !== originalComparableNickname ||
    avatarUri !== originalComparableAvatarUri ||
    gender !== originalGender ||
    effectiveBirthday !== originalBirthday;
  const canSave = Boolean(accessToken) && trimmedNickname.length > 0 && hasChanges;

  const updateMutation = useMutation({
    mutationFn: () =>
      updateProfile(accessToken as string, {
        avatarUrl: avatarUri,
        birthday: effectiveBirthday,
        gender,
        nickname: trimmedNickname,
      }),
    onSuccess: (profile) => {
      setNicknameDraft(null);
      setAvatarUriDraft(null);
      setGenderDraft(undefined);
      setBirthday(null);
      setUserProfile(profile);
      queryClient.setQueryData(['user-profile'], profile);
      Alert.alert('已保存', '个人资料已更新', [
        {
          text: '确定',
          onPress: () => router.back(),
        },
      ]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAccount(accessToken as string),
    onSuccess: async () => {
      await clearClientSession();
    },
  });

  function openNicknameSheet(): void {
    setNicknameInput(trimmedNickname);
    setProfileSheetMode('nickname');
  }

  function confirmNickname(): void {
    const nextNickname = nicknameInput.trim();
    if (!nextNickname) {
      Alert.alert('昵称不能为空', '请输入 1-30 个字符的昵称。');
      return;
    }

    setNicknameDraft(nextNickname);
    setProfileSheetMode(null);
  }

  function openBirthdaySheet(): void {
    const [year, month, day] = effectiveBirthday?.split('-') ?? [];
    setBirthYear(year ?? '1996');
    setBirthMonth(month ?? '03');
    setBirthDay(day ?? '15');
    setProfileSheetMode('birthday');
  }

  const monthOptions = useMemo(() => getMonthOptions(birthYear), [birthYear]);
  const normalizedBirthMonth = monthOptions.includes(birthMonth)
    ? birthMonth
    : monthOptions[monthOptions.length - 1] ?? '01';
  const dayOptions = useMemo(
    () => getDayOptions(birthYear, normalizedBirthMonth),
    [birthYear, normalizedBirthMonth],
  );
  const normalizedBirthDay = dayOptions.includes(birthDay)
    ? birthDay
    : dayOptions[dayOptions.length - 1] ?? '01';

  function confirmBirthday(): void {
    setBirthMonth(normalizedBirthMonth);
    setBirthDay(normalizedBirthDay);
    setBirthday(`${birthYear}-${normalizedBirthMonth}-${normalizedBirthDay}`);
    setProfileSheetMode(null);
  }

  async function pickAvatar(): Promise<void> {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('无法访问相册', '请在系统设置中允许了然访问照片。');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    setAvatarUriDraft(result.assets[0].uri);
  }

  function onSave(): void {
    if (!accessToken) {
      Alert.alert('登录已失效', '请重新登录后再修改个人资料。');
      return;
    }

    if (!trimmedNickname) {
      Alert.alert('昵称不能为空', '请输入 1-30 个字符的昵称。');
      return;
    }

    updateMutation.mutate(undefined, {
      onError: (error) => {
        const message =
          error instanceof ApiClientError ? error.message : '个人资料保存失败，请稍后重试。';
        Alert.alert('保存失败', message);
      },
    });
  }

  function confirmDeleteAccount(): void {
    if (!accessToken || deleteMutation.isPending) {
      return;
    }

    Alert.alert(
      '注销账户',
      '注销后账号和相关数据将被永久删除，此操作不可撤销。',
      [
        { style: 'cancel', text: '取消' },
        {
          style: 'destructive',
          text: '确认注销',
          onPress: () => {
            deleteMutation.mutate(undefined, {
              onError: (error) => {
                const message =
                  error instanceof ApiClientError ? error.message : '注销账户失败，请稍后重试。';
                Alert.alert('注销失败', message);
              },
            });
          },
        },
      ],
    );
  }

  if (profileQuery.isLoading) {
    return (
      <YStack alignItems="center" backgroundColor="$surfacePage" flex={1} justifyContent="center">
        <ActivityIndicator />
      </YStack>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.topbar}>
        <Pressable
          accessibilityLabel="返回"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>{'<'}</Text>
        </Pressable>
        <Text style={styles.title}>个人资料</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarArea}>
          <Pressable onPress={() => void pickAvatar()} style={styles.avatarWrapper}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{avatarLabel}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
          </Pressable>
          <Text style={styles.avatarHint}>点击修改头像</Text>
          <Text style={styles.displayName}>{trimmedNickname || '了然用户'}</Text>
        </View>

        <SectionHeader>基本信息</SectionHeader>
        <ListGroup>
          <Row
            detail={trimmedNickname || '未设置'}
            label="昵称"
            onPress={openNicknameSheet}
          />
          <Row
            detail={formatGender(gender)}
            label="性别"
            onPress={() => setProfileSheetMode('gender')}
          />
          <Row
            detail={effectiveBirthday ?? '暂未设置'}
            label="生日"
            onPress={openBirthdaySheet}
            withBorder={false}
          />
        </ListGroup>

        <SectionHeader>账户安全</SectionHeader>
        <ListGroup>
          <Row
            detail={profileQuery.data?.maskedPhoneNumber ?? '未绑定'}
            label="手机号"
          />
          <Row
            detail={profileQuery.data?.loginMethod === 'wechat' ? '已绑定' : '未绑定'}
            label="微信"
          />
          <Row
            detail={formatLoginMethod(profileQuery.data?.loginMethod ?? summary.loginMethod)}
            label="登录方式"
            withBorder={false}
          />
        </ListGroup>

        <SectionHeader>会员状态</SectionHeader>
        <View style={styles.membershipCard}>
          <Text style={styles.membershipTitle}>全功能体验</Text>
          <Text style={styles.membershipDetail}>MVP 期间开放基础账户能力</Text>
          <Text style={styles.membershipCta}>查看会员功能 {'>'}</Text>
        </View>

        <View style={styles.actions}>
          <Row
            destructive
            label={deleteMutation.isPending ? '注销中...' : '注销账户'}
            onPress={confirmDeleteAccount}
            withBorder={false}
          />
        </View>

        <Button
          disabled={!canSave || updateMutation.isPending}
          marginHorizontal="$4"
          marginTop="$6"
          onPress={onSave}
        >
          {updateMutation.isPending ? '保存中...' : '保存资料'}
        </Button>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setProfileSheetMode(null)}
        transparent
        visible={profileSheetMode !== null}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel="关闭资料编辑"
            onPress={() => setProfileSheetMode(null)}
            style={styles.modalOverlay}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            {profileSheetMode === 'nickname' ? (
              <>
                <Text style={styles.sheetTitle}>修改昵称</Text>
                <TextInput
                  autoFocus
                  maxLength={30}
                  onChangeText={setNicknameInput}
                  placeholder="输入新昵称"
                  style={styles.sheetInput}
                  value={nicknameInput}
                />
                <Text style={styles.sheetHint}>1-30 个字符</Text>
                <Button marginTop="$4" onPress={confirmNickname}>
                  保存
                </Button>
              </>
            ) : null}
            {profileSheetMode === 'gender' ? (
              <>
                <Text style={styles.sheetTitle}>选择性别</Text>
                {genderOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      setGenderDraft(option.value);
                      setProfileSheetMode(null);
                    }}
                    style={({ pressed }) => [
                      styles.sheetOption,
                      pressed ? styles.rowPressed : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sheetOptionText,
                        gender === option.value ? styles.sheetOptionTextActive : null,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {gender === option.value ? <Text style={styles.sheetCheck}>✓</Text> : null}
                  </Pressable>
                ))}
              </>
            ) : null}
            {profileSheetMode === 'birthday' ? (
              <>
                <Text style={styles.sheetTitle}>选择生日</Text>
                <View style={styles.pickerRow}>
                  <ScrollView style={styles.pickerColumn}>
                    {yearOptions.map((year) => (
                      <Pressable
                        key={year}
                        onPress={() => setBirthYear(year)}
                        style={[
                          styles.pickerOption,
                          birthYear === year ? styles.pickerOptionActive : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            birthYear === year ? styles.pickerOptionTextActive : null,
                          ]}
                        >
                          {year} 年
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  <ScrollView style={styles.pickerColumn}>
                    {monthOptions.map((month) => (
                      <Pressable
                        key={month}
                        onPress={() => setBirthMonth(month)}
                        style={[
                          styles.pickerOption,
                          normalizedBirthMonth === month ? styles.pickerOptionActive : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            normalizedBirthMonth === month ? styles.pickerOptionTextActive : null,
                          ]}
                        >
                          {month} 月
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  <ScrollView style={styles.pickerColumn}>
                    {dayOptions.map((day) => (
                      <Pressable
                        key={day}
                        onPress={() => setBirthDay(day)}
                        style={[
                          styles.pickerOption,
                          normalizedBirthDay === day ? styles.pickerOptionActive : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            normalizedBirthDay === day ? styles.pickerOptionTextActive : null,
                          ]}
                        >
                          {day} 日
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
                <Text style={styles.sheetHint}>当前选择：{birthYear}-{normalizedBirthMonth}-{normalizedBirthDay}</Text>
                <Button marginTop="$4" onPress={confirmBirthday}>
                  确认
                </Button>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: page,
    flex: 1,
  },
  topbar: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  backButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    marginLeft: -4,
    width: 32,
  },
  backIcon: {
    color: '#374151',
    fontSize: 22,
    fontWeight: '700',
  },
  title: {
    color: text,
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    paddingBottom: 32,
  },
  avatarArea: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingTop: 32,
  },
  avatarWrapper: {
    height: 86,
    width: 86,
  },
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: brand,
    borderRadius: 43,
    height: 86,
    justifyContent: 'center',
    width: 86,
  },
  avatarImage: {
    backgroundColor: brandLight,
    borderRadius: 43,
    height: 86,
    width: 86,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  cameraBadge: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    bottom: 0,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    width: 30,
  },
  cameraIcon: {
    fontSize: 13,
  },
  avatarHint: {
    color: muted,
    fontSize: 12,
    marginTop: 8,
  },
  displayName: {
    color: text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  sectionHeader: {
    color: muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    marginBottom: 8,
    marginHorizontal: 20,
    marginTop: 10,
  },
  group: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  row: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  rowBorder: {
    borderBottomColor: border,
    borderBottomWidth: 1,
  },
  rowPressed: {
    backgroundColor: page,
  },
  rowLabel: {
    color: '#374151',
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  rowDetail: {
    color: muted,
    fontSize: 14,
  },
  chevron: {
    color: '#D1D5DB',
    fontSize: 18,
    fontWeight: '700',
  },
  destructive: {
    color: '#EF4444',
  },
  membershipCard: {
    backgroundColor: brand,
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 20,
    shadowColor: brandAccent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
  },
  membershipTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  membershipDetail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 6,
  },
  membershipCta: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 14,
  },
  actions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 32,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    height: 4,
    marginBottom: 14,
    width: 40,
  },
  sheetTitle: {
    color: text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
  },
  sheetInput: {
    width: '100%',
  },
  sheetHint: {
    color: muted,
    fontSize: 12,
    marginTop: 8,
  },
  sheetOption: {
    alignItems: 'center',
    borderBottomColor: border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 50,
    paddingHorizontal: 8,
  },
  sheetOptionText: {
    color: '#374151',
    flex: 1,
    fontSize: 14,
  },
  sheetOptionTextActive: {
    color: brand,
    fontWeight: '700',
  },
  sheetCheck: {
    color: brand,
    fontSize: 16,
    fontWeight: '700',
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerColumn: {
    backgroundColor: page,
    borderRadius: 12,
    flex: 1,
    maxHeight: 190,
  },
  pickerOption: {
    alignItems: 'center',
    minHeight: 42,
    justifyContent: 'center',
  },
  pickerOptionActive: {
    backgroundColor: brandLight,
  },
  pickerOptionText: {
    color: '#6B7280',
    fontSize: 14,
  },
  pickerOptionTextActive: {
    color: brand,
    fontWeight: '700',
  },
});
