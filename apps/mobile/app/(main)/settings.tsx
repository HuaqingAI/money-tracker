import { Button, Text } from '@money-tracker/ui';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';

import { ApiClientError, deleteAccount } from '../../lib/api-client';
import { getAppVersion } from '../../lib/runtime-config';
import { clearClientSession } from '../../lib/session';
import { useAuthStore } from '../../stores/auth-store';

const brand = '#1A6B5A';
const brandLight = '#E8F5F1';
const page = '#F9FAFB';
const border = '#F3F4F6';
const text = '#111827';
const body = '#374151';
const muted = '#9CA3AF';

function SectionHeader({ children }: { children: string }) {
  return <Text style={styles.sectionHeader}>{children}</Text>;
}

function Group({ children }: { children: ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

function Row({
  icon,
  title,
  detail,
  badge,
  onPress,
  destructive = false,
  withBorder = true,
}: {
  icon: string;
  title: string;
  detail?: string;
  badge?: string;
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
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowTitle, destructive ? styles.destructive : null]}>
        {title}
      </Text>
      {badge ? <Text style={styles.badge}>{badge}</Text> : null}
      {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
      {onPress ? <Text style={styles.chevron}>{'>'}</Text> : null}
    </Pressable>
  );
}

function ToggleRow({
  icon,
  title,
  detail,
  value,
  onValueChange,
  withBorder = true,
}: {
  icon: string;
  title: string;
  detail: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  withBorder?: boolean;
}) {
  return (
    <View style={[styles.toggleRow, withBorder ? styles.rowBorder : null]}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={styles.toggleCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.toggleDetail}>{detail}</Text>
      </View>
      <Switch
        ios_backgroundColor="#D1D5DB"
        onValueChange={onValueChange}
        thumbColor="#FFFFFF"
        trackColor={{ false: '#D1D5DB', true: brand }}
        value={value}
      />
    </View>
  );
}

function formatLoginMethod(value: string): string {
  if (value === 'wechat') {
    return '微信';
  }

  if (value === 'phone') {
    return '手机号验证码';
  }

  return '未知';
}

export default function SettingsScreen() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const loginMethod = useAuthStore((state) => state.user.loginMethod);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [insightEnabled, setInsightEnabled] = useState(true);
  const [reportEnabled, setReportEnabled] = useState(true);
  const [giftEnabled, setGiftEnabled] = useState(true);
  const [productEnabled, setProductEnabled] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteAccount(accessToken as string),
    onSuccess: async () => {
      await clearClientSession();
    },
  });

  async function onLogout(): Promise<void> {
    await clearClientSession();
  }

  function confirmLogout(): void {
    Alert.alert('确认退出登录？', '退出后需要重新登录才能继续使用。', [
      { style: 'cancel', text: '取消' },
      {
        style: 'destructive',
        text: '退出',
        onPress: () => {
          void onLogout();
        },
      },
    ]);
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

  function showUnavailable(title: string): void {
    Alert.alert(title, '该能力将在后续版本开放。');
  }

  function confirmClearCache(): void {
    Alert.alert('清除本地缓存？', '缓存清除后不会影响你的账户数据。', [
      { style: 'cancel', text: '取消' },
      { text: '清除', onPress: () => Alert.alert('已清除', '本地缓存已清除。') },
    ]);
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
        <Text style={styles.title}>设置</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader>数据与隐私</SectionHeader>
        <Group>
          <Row
            badge={securityOpen ? '收起' : undefined}
            icon="🔒"
            onPress={() => setSecurityOpen((current) => !current)}
            title="数据安全说明"
          />
          {securityOpen ? (
            <View style={styles.securityPanel}>
              <View style={styles.securityItem}>
                <View style={styles.securityIcon}>
                  <Text style={styles.securityIconText}>锁</Text>
                </View>
                <View style={styles.securityCopy}>
                  <Text style={styles.securityTitle}>加密存储</Text>
                  <Text style={styles.securityText}>账户资料与财务数据在必要范围内加密保存。</Text>
                </View>
              </View>
              <View style={styles.securityItem}>
                <View style={styles.securityIcon}>
                  <Text style={styles.securityIconText}>盾</Text>
                </View>
                <View style={styles.securityCopy}>
                  <Text style={styles.securityTitle}>传输加密</Text>
                  <Text style={styles.securityText}>所有 API 请求通过 HTTPS/TLS 传输。</Text>
                </View>
              </View>
              <View style={styles.securityItem}>
                <View style={styles.securityIcon}>
                  <Text style={styles.securityIconText}>隐</Text>
                </View>
                <View style={styles.securityCopy}>
                  <Text style={styles.securityTitle}>最小化采集</Text>
                  <Text style={styles.securityText}>仅处理记账所需的交易要素，不额外采集无关信息。</Text>
                </View>
              </View>
              <View style={styles.securityItem}>
                <View style={styles.securityIcon}>
                  <Text style={styles.securityIconText}>控</Text>
                </View>
                <View style={styles.securityCopy}>
                  <Text style={styles.securityTitle}>你的数据你做主</Text>
                  <Text style={styles.securityText}>可在设置中发起注销账户并清除本地会话。</Text>
                </View>
              </View>
            </View>
          ) : null}
          <Row
            badge="管理"
            icon="🔔"
            onPress={() => router.push('/(setup)/permissions')}
            title="通知权限管理"
          />
          <Row
            icon="📂"
            onPress={() => showUnavailable('数据导出')}
            title="数据导出"
          />
          <Row
            detail="23.5 MB"
            icon="🗑"
            onPress={confirmClearCache}
            title="清除本地缓存"
            withBorder={false}
          />
        </Group>

        <SectionHeader>通知偏好</SectionHeader>
        <Group>
          <ToggleRow
            detail="消费异常、趋势变化等智能发现"
            icon="💡"
            onValueChange={setInsightEnabled}
            title="AI 洞察推送"
            value={insightEnabled}
          />
          <ToggleRow
            detail="新报表生成时提醒查看"
            icon="📊"
            onValueChange={setReportEnabled}
            title="周报 / 月报提醒"
            value={reportEnabled}
          />
          <ToggleRow
            detail="即将到来的人情事件和回礼建议"
            icon="🎁"
            onValueChange={setGiftEnabled}
            title="人情提醒"
            value={giftEnabled}
          />
          <ToggleRow
            detail="新功能上线、版本更新通知"
            icon="📢"
            onValueChange={setProductEnabled}
            title="产品更新"
            value={productEnabled}
            withBorder={false}
          />
        </Group>

        <SectionHeader>通用</SectionHeader>
        <Group>
          <Row
            detail="简体中文"
            icon="🌐"
            onPress={() => showUnavailable('语言')}
            title="语言"
          />
          <Row
            detail="CNY ¥"
            icon="💰"
            onPress={() => showUnavailable('默认货币')}
            title="默认货币"
          />
          <Row
            detail="跟随系统"
            icon="🌓"
            onPress={() => showUnavailable('深色模式')}
            title="深色模式"
            withBorder={false}
          />
        </Group>

        <SectionHeader>关于</SectionHeader>
        <Group>
          <Row icon="ℹ️" onPress={() => showUnavailable('关于我们')} title="关于我们" />
          <Row icon="📜" onPress={() => router.push('/(main)/legal')} title="用户协议" />
          <Row icon="🔏" onPress={() => router.push('/(main)/legal?type=privacy')} title="隐私政策" />
          <Row icon="💬" onPress={() => showUnavailable('意见反馈')} title="意见反馈" />
          <Row
            detail={formatLoginMethod(loginMethod)}
            icon="🔑"
            title="当前登录方式"
          />
          <Row
            destructive
            icon="删"
            onPress={confirmDeleteAccount}
            title={deleteMutation.isPending ? '注销中...' : '注销账户'}
            withBorder={false}
          />
        </Group>

        <Button marginHorizontal="$4" marginTop="$6" onPress={confirmLogout}>
          退出登录
        </Button>
        <Text style={styles.version}>版本 {getAppVersion()}</Text>
      </ScrollView>
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
    paddingBottom: 36,
  },
  sectionHeader: {
    color: muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    marginBottom: 8,
    marginHorizontal: 20,
    marginTop: 24,
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
  toggleRow: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    gap: 12,
    minHeight: 66,
    paddingHorizontal: 16,
  },
  rowBorder: {
    borderBottomColor: border,
    borderBottomWidth: 1,
  },
  rowPressed: {
    backgroundColor: page,
  },
  rowIcon: {
    color: brand,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    width: 24,
  },
  rowTitle: {
    color: body,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  rowDetail: {
    color: muted,
    fontSize: 14,
  },
  badge: {
    backgroundColor: brandLight,
    borderRadius: 999,
    color: brand,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chevron: {
    color: '#D1D5DB',
    fontSize: 18,
    fontWeight: '700',
  },
  destructive: {
    color: '#EF4444',
  },
  securityPanel: {
    backgroundColor: 'rgba(232,245,241,0.45)',
    borderBottomColor: border,
    borderBottomWidth: 1,
    gap: 16,
    padding: 16,
  },
  securityItem: {
    flexDirection: 'row',
    gap: 12,
  },
  securityIcon: {
    alignItems: 'center',
    backgroundColor: brandLight,
    borderRadius: 8,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  securityIconText: {
    color: brand,
    fontSize: 12,
    fontWeight: '700',
  },
  securityCopy: {
    flex: 1,
  },
  securityTitle: {
    color: text,
    fontSize: 14,
    fontWeight: '700',
  },
  securityText: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  toggleCopy: {
    flex: 1,
  },
  toggleDetail: {
    color: muted,
    fontSize: 12,
    marginTop: 3,
  },
  version: {
    color: '#D1D5DB',
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
});
