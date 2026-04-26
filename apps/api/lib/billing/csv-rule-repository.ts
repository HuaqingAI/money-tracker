import {
  BILLING_IMPORT_ERROR_CODES,
  type BillingCsvParseRule,
  billingCsvParseRuleSchema,
  type CsvRuleUpdateInput,
  type Database,
  type Json,
} from '@money-tracker/shared';

import { getSupabaseAdmin } from '../db/supabase-admin';
import { DEFAULT_CSV_PARSE_RULES } from './default-csv-rules';
import { BillingImportError } from './errors';

type CsvRuleRow = Database['billing']['Tables']['csv_parse_rules']['Row'];

export interface CsvRuleRepository {
  getActiveRules(): Promise<BillingCsvParseRule[]>;
  upsertRule(input: CsvRuleUpdateInput): Promise<CsvRuleRow>;
}

function shouldUseDevelopmentFallback(): boolean {
  return process.env.NODE_ENV !== 'production';
}

function sanitizeRuleConfig(rule: BillingCsvParseRule): Json {
  return JSON.parse(JSON.stringify(rule)) as Json;
}

function parseRuleRow(row: CsvRuleRow): BillingCsvParseRule {
  const parsed = billingCsvParseRuleSchema.safeParse(row.rule_config);

  if (!parsed.success) {
    throw new BillingImportError(
      BILLING_IMPORT_ERROR_CODES.invalidCsvRule,
      parsed.error.issues[0]?.message ?? 'CSV 解析规则无效',
      500,
    );
  }

  return {
    ...parsed.data,
    platform: parsed.data.platform,
    version: row.version,
  };
}

export class SupabaseCsvRuleRepository implements CsvRuleRepository {
  async getActiveRules(): Promise<BillingCsvParseRule[]> {
    const { data, error } = await getSupabaseAdmin()
      .schema('billing')
      .from('csv_parse_rules')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      if (shouldUseDevelopmentFallback()) {
        return DEFAULT_CSV_PARSE_RULES;
      }

      throw new BillingImportError(
        BILLING_IMPORT_ERROR_CODES.importServiceUnavailable,
        'CSV 解析规则暂不可用',
        503,
      );
    }

    if (!data || data.length === 0) {
      if (shouldUseDevelopmentFallback()) {
        return DEFAULT_CSV_PARSE_RULES;
      }

      throw new BillingImportError(
        BILLING_IMPORT_ERROR_CODES.invalidCsvRule,
        '没有可用的 CSV 解析规则',
        500,
      );
    }

    const latestByPlatform = new Map<string, CsvRuleRow>();
    for (const row of data) {
      if (!latestByPlatform.has(row.platform)) {
        latestByPlatform.set(row.platform, row);
      }
    }

    return Array.from(latestByPlatform.values()).map(parseRuleRow);
  }

  async upsertRule(input: CsvRuleUpdateInput): Promise<CsvRuleRow> {
    if (input.isActive !== false) {
      const { error: deactivateError } = await getSupabaseAdmin()
        .schema('billing')
        .from('csv_parse_rules')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('platform', input.platform)
        .eq('is_active', true);

      if (deactivateError) {
        throw new BillingImportError(
          BILLING_IMPORT_ERROR_CODES.csvRulesUpdateFailed,
          '更新 CSV 解析规则失败',
          500,
        );
      }
    }

    const { data, error } = await getSupabaseAdmin()
      .schema('billing')
      .from('csv_parse_rules')
      .upsert(
        {
          platform: input.platform,
          version: input.version,
          rule_config: sanitizeRuleConfig(input.ruleConfig),
          is_active: input.isActive ?? true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'platform,version',
        },
      )
      .select('*')
      .single();

    if (error || !data) {
      throw new BillingImportError(
        BILLING_IMPORT_ERROR_CODES.csvRulesUpdateFailed,
        '更新 CSV 解析规则失败',
        500,
      );
    }

    return data;
  }
}

export function getCsvRuleRepository(): CsvRuleRepository {
  return new SupabaseCsvRuleRepository();
}

