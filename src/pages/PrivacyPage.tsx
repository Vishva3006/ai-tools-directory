import { Shield, Eye, Database, Lock, Bell, UserCheck, Mail } from 'lucide-react';

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

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-blue-100">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 lg:p-10">

          <p className="text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            At <strong className="text-slate-800 dark:text-white">AI Tools Directory</strong>, your privacy is our priority.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
            Please read this policy carefully. By using our service, you consent to the practices described here.
          </p>

          <Section title="Information We Collect" icon={Database}>
            <p><strong className="text-slate-700 dark:text-slate-300">Account Data:</strong> When you register, we collect your name, email address, and profile photo (if provided via OAuth).</p>
            <p><strong className="text-slate-700 dark:text-slate-300">Usage Data:</strong> We automatically collect information about how you interact with the site — pages visited, search queries, tools viewed, and device/browser information.</p>
            <p><strong className="text-slate-700 dark:text-slate-300">Content You Submit:</strong> Tool submissions, reviews, ratings, and contact messages are stored securely in our database.</p>
            <p><strong className="text-slate-700 dark:text-slate-300">Cookies:</strong> We use essential cookies for authentication and optional analytics cookies (you may opt out at any time).</p>
          </Section>

          <Section title="How We Use Your Information" icon={Eye}>
            <ul className="list-disc list-inside space-y-2">
              <li>To operate and maintain the AI Tools Directory platform</li>
              <li>To process tool submissions and send status notifications</li>
              <li>To respond to your support and contact requests</li>
              <li>To personalize your experience (favorites, recommendations)</li>
              <li>To detect and prevent fraud or abuse</li>
              <li>To send optional newsletters (only with your explicit consent)</li>
              <li>To comply with applicable legal obligations</li>
            </ul>
          </Section>

          <Section title="Data Sharing" icon={UserCheck}>
            <p>We do <strong className="text-slate-700 dark:text-slate-300">not</strong> sell your personal data to third parties. We may share your information with:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-slate-700 dark:text-slate-300">Supabase:</strong> our database and authentication provider (data stored in the US)</li>
              <li><strong className="text-slate-700 dark:text-slate-300">Analytics providers</strong> (anonymized, aggregated data only)</li>
              <li><strong className="text-slate-700 dark:text-slate-300">Law enforcement</strong> when required by law or to protect our legal rights</li>
            </ul>
          </Section>

          <Section title="Data Security" icon={Lock}>
            <p>
              We implement industry-standard security measures including TLS encryption in transit,
              row-level security in our database, and regular security reviews. No method of
              transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="Your Rights" icon={Bell}>
            <p>Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-slate-700 dark:text-slate-300">Access:</strong> request a copy of the data we hold about you</li>
              <li><strong className="text-slate-700 dark:text-slate-300">Correction:</strong> request that we update inaccurate information</li>
              <li><strong className="text-slate-700 dark:text-slate-300">Deletion:</strong> request that we delete your account and associated data</li>
              <li><strong className="text-slate-700 dark:text-slate-300">Portability:</strong> request an export of your data in a machine-readable format</li>
              <li><strong className="text-slate-700 dark:text-slate-300">Opt-out:</strong> unsubscribe from marketing communications at any time</li>
            </ul>
            <p>To exercise any of these rights, please contact us at <a href="mailto:privacy@aitoolsdirectory.com" className="text-blue-600 dark:text-blue-400 underline">privacy@aitoolsdirectory.com</a>.</p>
          </Section>

          <Section title="Children's Privacy" icon={Shield}>
            <p>
              Our service is not directed to children under the age of 13. We do not knowingly collect
              personal information from children. If you believe we have inadvertently collected data
              from a child, please contact us immediately.
            </p>
          </Section>

          <Section title="Changes to This Policy" icon={Bell}>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any significant
              changes by updating the "Last updated" date at the top and, where appropriate, sending
              you an email notification. Continued use of the service constitutes acceptance of the
              revised policy.
            </p>
          </Section>

          <Section title="Contact" icon={Mail}>
            <p>
              If you have questions or concerns about this Privacy Policy, please contact us:
            </p>
            <p>
              <strong className="text-slate-700 dark:text-slate-300">Email:</strong>{' '}
              <a href="mailto:privacy@aitoolsdirectory.com" className="text-blue-600 dark:text-blue-400 underline">
                privacy@aitoolsdirectory.com
              </a>
            </p>
            <p>Or via our <a href="/contact" className="text-blue-600 dark:text-blue-400 underline">Contact page</a>.</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
