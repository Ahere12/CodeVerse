import {
  Award,
  BookOpen,
  Code2,
  FileText,
  FolderGit2,
  GraduationCap,
  Home,
  Languages,
  type LucideIcon,
  Map,
  Settings,
  Swords,
  User,
  UserCircle,
  Users,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** One-line description used by search and placeholder pages. */
  description: string;
  /** Build phase this section ships in. Items with a phase are not yet built. */
  phase?: number;
  /** What the section will contain, shown honestly while it is being built. */
  planned?: string[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    label: 'Learn',
    items: [
      { to: '/', label: 'Home', icon: Home, description: 'Your dashboard, goals and progress.' },
      { to: '/learn', label: 'Learn', icon: GraduationCap, description: 'Start here: placement quiz, guided path and bookmarks.' },
      { to: '/languages', label: 'Languages', icon: Languages, description: '30 languages, what they are for, and where to start.' },
      { to: '/courses', label: 'Courses', icon: BookOpen, description: 'Interactive courses with graded exercises.' },
      { to: '/roadmaps', label: 'Roadmaps', icon: Map, description: 'Career paths with clickable milestones and progress.' },
    ],
  },
  {
    label: 'Practice',
    items: [
      { to: '/challenges', label: 'Challenges', icon: Swords, description: 'Daily challenge and practice problems with real tests.' },
      { to: '/projects', label: 'Projects', icon: FolderGit2, description: 'Guided real-world projects with starter files.' },
      { to: '/playground', label: 'Playground', icon: Code2, description: 'Multi-file editor: HTML/CSS/JS with live preview, Python and SQL.' },
    ],
  },
  {
    label: 'Reference',
    items: [
      {
        to: '/docs', label: 'Documentation', icon: FileText, description: 'Searchable references, cheat sheets and glossary.', phase: 7,
        planned: ['Syntax references and built-ins', 'Cheat sheets and common patterns', 'Glossary of programming terms', 'Developer tools: JSON, regex, Markdown'],
      },
      {
        to: '/community', label: 'Community', icon: Users, description: 'Share projects and ask questions.', phase: 7,
        planned: ['Requires accounts and a backend — opt-in only', 'Project gallery, Q&A and feedback', 'Reporting and moderation'],
      },
    ],
  },
  {
    label: 'You',
    items: [
      { to: '/achievements', label: 'Achievements', icon: Award, description: 'Badges you have earned and what is next.' },
      { to: '/profile', label: 'Profile', icon: User, description: 'Your stats and learning history.' },
      { to: '/account', label: 'Account', icon: UserCircle, description: 'Sign in with GitHub, Discord or Google to sync progress.' },
      { to: '/settings', label: 'Settings', icon: Settings, description: 'Theme, accessibility, goals and data.' },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV.flatMap((g) => g.items);

