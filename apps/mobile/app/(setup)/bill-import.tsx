import { BILLING_IMPORT_MAX_FILE_SIZE_BYTES, type ImportCsvResult } from '@money-tracker/shared';
import { Button, Text } from '@money-tracker/ui';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import {
  BillImportSourceCard,
} from '../../components/billing/bill-import-source-card';
import type { BillingImportSource } from '../../components/billing/types';
import { ApiClientError } from '../../lib/api-client';
import { uploadBillingCsv, type BillingCsvUploadFile } from '../../lib/billing-api';
import { useAuthStore } from '../../stores/auth-store';

type UploadState = 'idle' | 'picking' | 'uploading' | 'success' | 'error';

interface SelectedFile {
  name: string;
  size: number | null;
  uri: string;
  mimeType: string | null;
}

function formatMegabytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function toUploadFile(file: SelectedFile): BillingCsvUploadFile {
  return {
    name: file.name,
    size: file.size,
    uri: file.uri,
    mimeType: file.mimeType,
  };
}

function mapErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return '上传失败，请检查网络后重试';
}

function getProcessingPath(result: ImportCsvResult): string {
  const params = new URLSearchParams({
    importId: result.importId,
    platform: result.platform,
    totalCount: String(result.totalCount),
    importedCount: String(result.importedCount),
    duplicateCount: String(result.duplicateCount),
    failedCount: String(result.failedCount),
  });

  return `/(setup)/import-processing?${params.toString()}`;
}

export default function BillImportScreen() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);
  const [source, setSource] = useState<BillingImportSource>('alipay');
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [status, setStatus] = useState<UploadState>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const pickFile = async () => {
    setStatus('picking');
    setMessage(null);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        setStatus('idle');
        setMessage('已取消选择，可以重新挑选账单文件');
        return;
      }

      const asset = result.assets[0];
      if (!asset) {
        setStatus('idle');
        setMessage('没有读取到文件，请重新选择');
        return;
      }

      const file = {
        name: asset.name,
        size: asset.size ?? null,
        uri: asset.uri,
        mimeType: asset.mimeType ?? null,
      };

      setSelectedFile(file);
      setStatus('idle');
      if (typeof file.size === 'number' && file.size > BILLING_IMPORT_MAX_FILE_SIZE_BYTES) {
        setMessage('CSV 文件不能超过 10MB');
      } else if (!file.name.toLowerCase().endsWith('.csv')) {
        setMessage('请选择 .csv 格式的账单文件');
      } else {
        setMessage('文件已就绪，可以开始导入');
      }
    } catch {
      setStatus('error');
      setMessage('文件选择失败，请重试');
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      setMessage('请先选择 CSV 账单文件');
      return;
    }

    if (!accessToken) {
      setStatus('error');
      setMessage('登录态已失效，请重新登录后再导入');
      return;
    }

    setStatus('uploading');
    setMessage(null);

    try {
      const result = await uploadBillingCsv(accessToken, toUploadFile(selectedFile));
      setStatus('success');
      setMessage('账单已上传，正在整理交易记录');
      router.replace(getProcessingPath(result) as never);
    } catch (error) {
      setStatus('error');
      setMessage(mapErrorMessage(error));
    }
  };

  const completeOnboarding = () => {
    if (session) {
      setSession({
        ...session,
        user: {
          ...session.user,
          needsOnboarding: false,
        },
      });
    }
  };

  const selectedFileIsValid =
    selectedFile !== null &&
    selectedFile.name.toLowerCase().endsWith('.csv') &&
    (typeof selectedFile.size !== 'number' ||
      selectedFile.size <= BILLING_IMPORT_MAX_FILE_SIZE_BYTES);
  const canUpload =
    selectedFileIsValid && status !== 'picking' && status !== 'uploading';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <YStack gap="$5">
          <YStack gap="$2">
            <Text variant="h1">导入历史账单</Text>
            <Text variant="body">
              选择支付宝或微信导出的 CSV 文件，了然会把历史消费整理成待确认记录。
            </Text>
          </YStack>

          <YStack gap="$3">
            <Text variant="h2">账单来源</Text>
            <BillImportSourceCard
              active={source === 'alipay'}
              description="支持支付宝导出的 GBK/GB18030 CSV"
              label="支付宝 CSV"
              onPress={() => setSource('alipay')}
              source="alipay"
            />
            <BillImportSourceCard
              active={source === 'wechat'}
              description="支持微信支付导出的 UTF-8 CSV"
              label="微信 CSV"
              onPress={() => setSource('wechat')}
              source="wechat"
            />
          </YStack>

          <YStack gap="$3" style={styles.panel}>
            <Text variant="h2">支付宝导出</Text>
            <Text variant="caption">支付宝 App → 我的 → 账单 → 右上角更多 → 开具交易流水证明。</Text>
            <Text variant="caption">选择 CSV 明细后下载原始文件，不需要手动修改表格内容。</Text>
          </YStack>

          <YStack gap="$3" style={styles.panel}>
            <Text variant="h2">文件</Text>
            <Pressable
              accessibilityLabel="选择 CSV 账单文件"
              accessibilityRole="button"
              onPress={pickFile}
              style={({ pressed }) => [
                styles.fileBox,
                pressed ? styles.fileBoxPressed : undefined,
              ]}
            >
              <YStack gap="$1">
                <Text variant="bodyMedium">
                  {selectedFile?.name ?? '选择 .csv 文件'}
                </Text>
                <Text variant="caption">
                  {selectedFile?.size
                    ? `大小 ${formatMegabytes(selectedFile.size)}，上限 10MB`
                    : '支持支付宝 CSV 和微信 CSV'}
                </Text>
              </YStack>
            </Pressable>

            {message ? (
              <Text
                color={status === 'error' ? '$error' : '$neutral600'}
                variant="caption"
              >
                {message}
              </Text>
            ) : null}

            <Button disabled={!canUpload} onPress={uploadFile}>
              {status === 'uploading' ? '上传中...' : '上传并导入'}
            </Button>
          </YStack>

          <XStack justifyContent="center">
            <Pressable
              accessibilityLabel="跳过账单导入"
              accessibilityRole="button"
              onPress={() => {
                completeOnboarding();
                router.replace('/(main)/dashboard');
              }}
            >
              <Text color="$neutral500" fontWeight="600">
                跳过，先看看
              </Text>
            </Pressable>
          </XStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  fileBox: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: 16,
  },
  fileBoxPressed: {
    opacity: 0.78,
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  safeArea: {
    flex: 1,
  },
});
