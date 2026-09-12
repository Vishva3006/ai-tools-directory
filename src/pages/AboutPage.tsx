import { Users, Target, Zap, Globe, Heart, Award } from 'lucide-react';

const TEAM = [
  {
    name: 'Alex Rivera',
    role: 'Founder & CEO',
    bio: 'Former ML engineer at Google. Passionate about democratizing AI tools for everyone.',
    initial: 'A',
    color: 'from-blue-500 to-teal-400',
  },
  {
    name: 'Sara Chen',
    role: 'Head of Curation',
    bio: 'Researcher with a background in NLP who reviews every tool submission personally.',
    initial: 'S',
    color: 'from-purple-500 to-pink-400',
  },
  {
    name: 'Marcus Webb',
    role: 'Lead Engineer',
    bio: 'Full-stack developer focused on building fast, accessible, and beautiful web experiences.',
    initial: 'M',
    color: 'from-orange-500 to-red-400',
  },
];

const STATS = [
  { label: 'AI Tools Listed', value: '2,400+' },
  { label: 'Monthly Visitors', value: '180K+' },
  { label: 'Categories', value: '40+' },
  { label: 'Countries Reached', value: '120+' },
];

const VALUES = [
  {
    icon: Target,
    title: 'Curated Quality',
    desc: 'Every tool is reviewed by a human before it goes live. No spam, no duplicates.',
  },
  {
    icon: Zap,
    title: 'Always Up-to-Date',
    desc: 'The AI space moves fast. We refresh tool info and rankings weekly.',
  },
  {
    icon: Globe,
    title: 'Globally Accessible',
    desc: 'We highlight free and freemium tools so everyone can benefit from AI.',
  },
  {
    icon: Heart,
    title: 'Community-Driven',
    desc: 'Built by AI enthusiasts for AI enthusiasts. Your ratings shape our rankings.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Users className="w-4 h-4" />
            About AI Tools Directory
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            We help you find the <span className="text-teal-300">right AI tool</span> for every job
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
            AI Tools Directory is a curated, community-powered platform where developers,
            creators, and businesses discover the best artificial intelligence solutions available today.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 -mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center shadow-sm"
            >
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{stat.value}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Our Mission</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            The AI landscape is growing at an unprecedented pace. New tools launch every day, making
            it overwhelming to find the right one for your specific need. We started AI Tools Directory
            to cut through the noise — hand-picking, categorizing, and rating AI tools so you can
            spend less time searching and more time building.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white mb-1">{title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Award className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Meet the Team</h2>
            <p className="text-slate-600 dark:text-slate-400">
              A small, passionate team dedicated to making AI accessible.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center mx-auto mb-4`}
                >
                  <span className="text-white text-xl font-bold">{member.initial}</span>
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-white mb-1">{member.name}</h3>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-3">{member.role}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
          Know a great AI tool we're missing?
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Our community thrives on submissions. If you've built or discovered an AI tool worth sharing, we'd love to feature it.
        </p>
        <a
          href="/submit"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
        >
          Submit a Tool
        </a>
      </section>
    </div>
  );
}
