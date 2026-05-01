import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-on-background font-body-md text-body-md">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/80 backdrop-blur-lg border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-lg">E</div>
            <span className="font-h3 text-h3 text-primary">Ethara</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="font-button text-button text-on-surface-variant hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="font-button text-button text-on-surface-variant hover:text-primary transition-colors">How It Works</a>
            <a href="#pricing" className="font-button text-button text-on-surface-variant hover:text-primary transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="font-button text-button text-primary hover:text-on-primary-fixed-variant transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link to="/register" className="font-button text-button bg-primary text-on-primary px-5 py-2 rounded-lg hover:bg-on-primary-fixed-variant transition-colors shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-fixed text-primary font-label-caps text-label-caps px-4 py-1.5 rounded-full mb-8">
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            AI-POWERED TASK MANAGEMENT
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-on-background leading-tight tracking-tight mb-6">
            Manage Tasks with
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-tertiary-container bg-clip-text text-transparent">
              Clarity & Speed
            </span>
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto text-lg leading-relaxed mb-10">
            Ethara helps teams organize projects, track progress, and deliver results. Built for modern teams who value simplicity and efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-button text-button px-8 py-3 rounded-lg hover:bg-on-primary-fixed-variant transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              Start Free
            </Link>
            <a href="#features" className="inline-flex items-center justify-center gap-2 border border-outline-variant text-on-surface font-button text-button px-8 py-3 rounded-lg hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[18px]">play_circle</span>
              See How It Works
            </a>
          </div>

          {/* Social Proof */}
          <div className="mt-16 flex flex-col items-center gap-3">
            <div className="flex -space-x-2">
              {['E', 'T', 'H', 'A'].map((letter, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm border-2 border-surface-container-lowest">
                  {letter}
                </div>
              ))}
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Trusted by <span className="font-medium text-on-surface">1,200+</span> teams worldwide
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-surface-container-lowest">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">Features</span>
            <h2 className="font-h1 text-h1 text-on-background mt-3 mb-4">Everything your team needs</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">Streamline your workflow with powerful tools designed for modern teams.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'view_kanban', title: 'Kanban Boards', desc: 'Visualize your workflow with drag-and-drop task boards. Move tasks between columns in real time.' },
              { icon: 'dashboard', title: 'Smart Dashboard', desc: 'Get a real-time overview of your team\u2019s progress with dynamic stats, charts, and insights.' },
              { icon: 'group', title: 'Team Management', desc: 'Invite members, assign roles, and manage permissions — all from one central workspace.' },
              { icon: 'assignment', title: 'Project Tracking', desc: 'Organize tasks under projects with progress tracking and milestone management.' },
              { icon: 'lock', title: 'Role-Based Access', desc: 'Admins and Members get tailored dashboards with appropriate controls and visibility.' },
              { icon: 'api', title: 'RESTful API', desc: 'Built on Spring Boot with JWT authentication, Swagger docs, and PostgreSQL storage.' },
            ].map((feature, i) => (
              <div key={i} className="bg-surface-bright border border-outline-variant rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-lg bg-primary-fixed text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined">{feature.icon}</span>
                </div>
                <h3 className="font-h3 text-h3 text-on-background mb-2">{feature.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">How It Works</span>
            <h2 className="font-h1 text-h1 text-on-background mt-3 mb-4">Get started in minutes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up as a team member and get instant access to your workspace.', icon: 'person_add' },
              { step: '02', title: 'Set Up Projects', desc: 'Admins create projects and assign tasks to team members.', icon: 'add_task' },
              { step: '03', title: 'Track & Deliver', desc: 'Move tasks through your Kanban board and monitor progress in real time.', icon: 'trending_up' },
            ].map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center mx-auto mb-6 shadow-md">
                  <span className="material-symbols-outlined text-[28px]">{step.icon}</span>
                </div>
                <span className="font-label-caps text-label-caps text-primary mb-2 block">{step.step}</span>
                <h3 className="font-h3 text-h3 text-on-background mb-2">{step.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{step.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-outline-variant"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-primary to-primary-container rounded-2xl p-12 text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-on-primary/5 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-on-primary/5 rounded-full -ml-12 -mb-12"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-on-primary mb-4">Ready to boost your team's productivity?</h2>
            <p className="font-body-md text-body-md text-on-primary/80 mb-8 max-w-lg mx-auto">
              Join thousands of teams using Ethara to ship faster and stay organized.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-surface-container-lowest text-primary font-button text-button px-8 py-3 rounded-lg hover:bg-surface-bright transition-colors shadow-md">
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant py-12 px-6 bg-surface-container-lowest">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-primary text-on-primary flex items-center justify-center font-bold text-sm">E</div>
            <span className="font-button text-button text-on-surface-variant">Ethara Task Manager</span>
          </div>
          <p className="font-body-sm text-body-sm text-outline">© 2026 Ethara AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
