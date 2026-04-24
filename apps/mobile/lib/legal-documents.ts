export type LegalDocumentType = 'terms' | 'privacy';

interface LegalDocumentDefinition {
  title: string;
  html: string;
}

const baseStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    margin: 0;
    padding: 24px 20px 40px;
    line-height: 1.7;
    color: #1f2937;
    background: #ffffff;
  }

  h1 {
    margin: 0 0 16px;
    font-size: 28px;
    line-height: 1.25;
    color: #111827;
  }

  h2 {
    margin: 28px 0 12px;
    font-size: 18px;
    color: #111827;
  }

  p {
    margin: 0 0 12px;
    font-size: 15px;
  }

  ul {
    margin: 0 0 12px;
    padding-left: 20px;
  }

  li {
    margin-bottom: 8px;
  }

  .notice {
    margin-top: 20px;
    padding: 12px 14px;
    border-radius: 12px;
    background: #f3f4f6;
    color: #4b5563;
    font-size: 13px;
  }
`;

const documents: Record<LegalDocumentType, LegalDocumentDefinition> = {
  terms: {
    title: '用户协议',
    html: `
      <html>
        <head><meta charset="utf-8" /><style>${baseStyles}</style></head>
        <body>
          <h1>用户协议</h1>
          <p>欢迎使用了然。当前为开发联调用占位协议页，用于验证注册流程中的应用内 WebView 打开行为。</p>
          <h2>服务说明</h2>
          <p>了然用于帮助用户记录和理解个人及家庭财务信息，部分功能依赖通知、登录态和本地数据处理能力。</p>
          <h2>账户与登录</h2>
          <ul>
            <li>你应确保提交的手机号或授权信息真实、可用。</li>
            <li>在正式版上线前，部分登录能力可能以开发态占位实现。</li>
            <li>你应妥善保管自己的设备和登录状态。</li>
          </ul>
          <h2>使用约束</h2>
          <ul>
            <li>不得利用本服务实施违法违规活动。</li>
            <li>不得恶意干扰服务稳定性或试图绕过权限控制。</li>
          </ul>
          <div class="notice">正式协议文案和线上地址后续补充；当前页面仅用于应用内查看体验验证。</div>
        </body>
      </html>
    `,
  },
  privacy: {
    title: '隐私政策',
    html: `
      <html>
        <head><meta charset="utf-8" /><style>${baseStyles}</style></head>
        <body>
          <h1>隐私政策</h1>
          <p>本页为开发联调用占位隐私政策，用于验证注册流程中的应用内 WebView 打开行为。</p>
          <h2>我们收集的信息</h2>
          <ul>
            <li>登录所需的基础身份信息，例如手机号或第三方授权标识。</li>
            <li>完成记账和个性化体验所需的设置与本地状态信息。</li>
          </ul>
          <h2>信息用途</h2>
          <ul>
            <li>用于完成账户注册、登录和会话维护。</li>
            <li>用于支持通知识别、账单整理和产品功能体验。</li>
          </ul>
          <h2>数据保护</h2>
          <p>我们会根据产品阶段采用合理的技术与管理措施保护你的信息安全。</p>
          <div class="notice">正式隐私政策文案和线上地址后续补充；当前页面仅用于应用内查看体验验证。</div>
        </body>
      </html>
    `,
  },
};

export function getLegalDocument(type: LegalDocumentType): LegalDocumentDefinition {
  return documents[type];
}
