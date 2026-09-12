import { FileText, Scale, AlertTriangle, Ban, CheckCircle, Mail, Globe, RefreshCw } from 'lucide-react';

const LAST_UPDATED = 'June 15, 2025';

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h2>
      </div>
      <div className="text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed pl-11">
        {children}
      </div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Scale className="w-4 h-4" />
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms &amp; Conditions</h1>
          <p className="text-blue-100">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 lg:p-10">

          <p className="text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            Please read these Terms &amp; Conditions ("Terms") carefully before using{' '}
            <strong className="text-slate-800 dark:text-white">AI Tools Directory</strong>{' '}
            (the "Service") operated by AI Tools Directory, Inc. ("we," "us," or "our").
            By accessing or using the Service you agree to be bound by these Terms.
            If you disagree with any part, please do not use the Service.
          </p>

          <Section title="Acceptance of Terms" icon={CheckCircle}>
            <p>
              By creating an account or using the Service in any way, you confirm that you are at
              least 13 years old and legally able to enter into these Terms. If you are using the
              Service on behalf of an organization, you represent that you have the authority to
              bind that organization to these Terms.
            </p>
          </Section>

          <Section title="Use of the Service" icon={Globe}>
            <p>You may use AI Tools Directory only for lawful purposes. You agree <strong className="text-slate-700 dark:text-slate-300">not</strong> to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Submit false, misleading, or spammy tool listings</li>
              <li>Scrape, crawl, or systematically extract data without written permission</li>
              <li>Attempt to access another user's account or private data</li>
              <li>Upload malicious code, links, or content</li>
              <li>Engage in harassment, hate speech, or abusive behavior</li>
              <li>Circumvent any security or rate-limiting mechanisms</li>
              <li>Use the Service for any commercial purpose without prior approval</li>
            </ul>
          </Section>

          <Section title="User-Generated Content" icon={FileText}>
            <p>
              When you submit a tool, write a review, or post any other content ("User Content"),
              you grant us a worldwide, non-exclusive, royalty-free license to use, display,
              reproduce, and distribute that content on our platform.
            </p>
            <p>
              You remain the owner of your User Content. You are solely responsible for ensuring
              your submissions do not infringe on third-party intellectual property rights.
              We reserve the right to remove any content at our discretion without prior notice.
            </p>
          </Section>

          <Section title="Intellectual Property" icon={Scale}>
            <p>
              All content, features, and functionality of AI Tools Directory — including but not
              limited to text, graphics, logos, icons, and software — are the exclusive property
              of AI Tools Directory, Inc. and are protected by applicable copyright and trademark laws.
            </p>
            <p>
              You may not reproduce, distribute, or create derivative works from our proprietary
              content without our express written consent.
            </p>
          </Section>

          <Section title="Prohibited Activities" icon={Ban}>
            <p>The following activities are strictly prohibited:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Reverse engineering or decompiling any portion of the Service</li>
              <li>Using automated bots to interact with the Service</li>
              <li>Attempting to introduce viruses or other malicious content</li>
              <li>Impersonating other users, staff, or organizations</li>
              <li>Violating any applicable local, national, or international laws</li>
            </ul>
            <p>
              Violation of these prohibitions may result in immediate account suspension and, where
              appropriate, referral to law enforcement.
            </p>
          </Section>

          <Section title="Disclaimer of Warranties" icon={AlertTriangle}>
            <p>
              The Service is provided on an <strong className="text-slate-700 dark:text-slate-300">"AS IS" and "AS AVAILABLE"</strong> basis
              without warranties of any kind, either express or implied, including but not limited
              to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
            <p>
              We do not warrant that the Service will be uninterrupted, error-free, or free of viruses.
              Tool listings on the directory are provided for informational purposes only; we do not
              endorse any listed tool.
            </p>
          </Section>

          <Section title="Limitation of Liability" icon={Scale}>
            <p>
              To the maximum extent permitted by applicable law, AI Tools Directory, Inc. shall not
              be liable for any indirect, incidental, special, consequential, or punitive damages —
              including loss of profits, data, or goodwill — arising out of or related to your use
              of or inability to use the Service.
            </p>
          </Section>

          <Section title="Modifications to Terms" icon={RefreshCw}>
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of
              material changes by updating the "Last updated" date. Your continued use of the Service
              after changes are posted constitutes your acceptance of the revised Terms.
            </p>
          </Section>

          <Section title="Governing Law" icon={Scale}>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the
              State of California, United States, without regard to its conflict of law provisions.
              Any disputes shall be subject to the exclusive jurisdiction of courts located in
              San Francisco County, California.
            </p>
          </Section>

          <Section title="Contact" icon={Mail}>
            <p>If you have questions about these Terms, please contact us:</p>
            <p>
              <strong className="text-slate-700 dark:text-slate-300">Email:</strong>{' '}
              <a href="mailto:legal@aitoolsdirectory.com" className="text-blue-600 dark:text-blue-400 underline">
                legal@aitoolsdirectory.com
              </a>
            </p>
            <p>Or via our <a href="/contact" className="text-blue-600 dark:text-blue-400 underline">Contact page</a>.</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
