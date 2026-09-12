import { AlertTriangle, Info, ExternalLink, Mail } from 'lucide-react';

const LAST_UPDATED = 'June 15, 2025';

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h2>
      </div>
      <div className="text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed pl-11">
        {children}
      </div>
    </section>
  );
}

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <AlertTriangle className="w-4 h-4" />
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Disclaimer</h1>
          <p className="text-orange-100">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-16">

        {/* Warning Banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 mb-8 flex gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong>Important:</strong> AI Tools Directory is an independent directory platform.
            We are not affiliated with, endorsed by, or sponsored by any of the AI tools or
            companies listed on this site.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 lg:p-10">

          <p className="text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            The information provided on <strong className="text-slate-800 dark:text-white">AI Tools Directory</strong> is
            for general informational purposes only. While we strive to keep information accurate
            and current, we make no representations or warranties of any kind, express or implied,
            about the completeness, accuracy, reliability, or availability of the information,
            products, or tools listed on this website.
          </p>

          <Section title="No Endorsement" icon={Info}>
            <p>
              The inclusion of any AI tool, product, or service in our directory does not constitute
              an endorsement, recommendation, or guarantee by AI Tools Directory. Listings are
              provided for informational purposes only. Users are strongly encouraged to conduct
              their own research before using any tool.
            </p>
          </Section>

          <Section title="Accuracy of Information" icon={AlertTriangle}>
            <p>
              Tool descriptions, pricing, features, and availability are submitted by tool owners
              or our editorial team and may not always reflect the most current information.
              Pricing and feature sets for AI tools can change frequently without notice.
            </p>
            <p>
              We make reasonable efforts to update listings, but we cannot guarantee that all
              information is accurate, complete, or current at any given time.
            </p>
          </Section>

          <Section title="Third-Party Links" icon={ExternalLink}>
            <p>
              Our website contains links to external websites and AI tools operated by third parties.
              These links are provided for your convenience only. We have no control over the
              content, privacy policies, or practices of third-party websites.
            </p>
            <p>
              We strongly advise you to review the privacy policy and terms of service of any
              third-party website you visit through our directory. AI Tools Directory bears no
              responsibility for the content or availability of linked external sites.
            </p>
          </Section>

          <Section title="User Reviews and Ratings" icon={Info}>
            <p>
              Ratings, reviews, and comments on AI Tools Directory are submitted by users and
              represent their personal opinions. They do not reflect the views of AI Tools Directory.
              We do not verify the accuracy of user-submitted reviews and are not responsible for
              any decisions made based on them.
            </p>
          </Section>

          <Section title="Affiliate Disclosure" icon={AlertTriangle}>
            <p>
              Some links on AI Tools Directory may be affiliate links. This means we may earn a
              small commission if you click on a link and make a purchase. This comes at no
              additional cost to you and does not influence our editorial decisions or tool rankings.
              Tools are listed based on merit and community feedback, not commercial relationships.
            </p>
          </Section>

          <Section title="Limitation of Liability" icon={AlertTriangle}>
            <p>
              In no event shall AI Tools Directory, its officers, directors, employees, or agents
              be liable for any direct, indirect, incidental, special, or consequential damages
              arising from your use of — or reliance on — information found on this website.
            </p>
            <p>
              You use this website and the tools discovered through it entirely at your own risk.
            </p>
          </Section>

          <Section title="Professional Advice" icon={Info}>
            <p>
              Nothing on this website should be construed as professional legal, financial,
              technical, or business advice. Always seek the advice of qualified professionals
              for decisions that affect your business or personal situation.
            </p>
          </Section>

          <Section title="Contact" icon={Mail}>
            <p>
              If you have questions about this disclaimer or believe any listing contains
              inaccurate information, please contact us:
            </p>
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
