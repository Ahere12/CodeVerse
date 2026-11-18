import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Languages, LanguageDetail } from './pages/Languages';
import { Achievements } from './pages/Achievements';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Glossary } from './pages/Glossary';
import { Courses, CourseDetail } from './pages/Courses';
import { Certificate } from './pages/Certificate';
import { InDevelopment } from './pages/InDevelopment';
import { NotFound } from './pages/NotFound';
import { ErrorPage } from './pages/ErrorPage';
import { Account } from './pages/Account';
import { Challenges } from './pages/Challenges';
import { Roadmaps, RoadmapDetail } from './pages/Roadmaps';
import { GuidedProjects, GuidedProjectDetail } from './pages/GuidedProjects';
import { ALL_NAV_ITEMS } from './lib/nav';

// Code-heavy pages (CodeMirror + parsers) load on demand.
const LessonPage = lazy(() => import('./pages/LessonPage'));
const Learn = lazy(() => import('./pages/Learn').then((m) => ({ default: m.Learn })));
const ContentCheck = lazy(() => import('./pages/ContentCheck'));
const Playground = lazy(() => import('./pages/Playground'));
const ChallengePage = lazy(() => import('./pages/ChallengePage'));
const Docs = lazy(() => import('./pages/Docs'));
const Tools = lazy(() => import('./pages/Tools'));

function Loading() {
  return (
    <div className="page" aria-busy="true">
      <div className="subtle" style={{ fontSize: 'var(--fs-sm)' }}>Loading…</div>
    </div>
  );
}
const lazyEl = (node: ReactNode) => <Suspense fallback={<Loading />}>{node}</Suspense>;

/** Sections not yet built render an honest "in development" page from their nav config. */
const inDevelopmentRoutes = ALL_NAV_ITEMS.filter((i) => i.phase).map((item) => ({
  path: item.to.slice(1),
  element: <InDevelopment item={item} />,
}));

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'learn', element: lazyEl(<Learn />) },
      { path: 'courses', element: <Courses /> },
      { path: 'courses/:courseId', element: <CourseDetail /> },
      { path: 'courses/:courseId/:lessonId', element: lazyEl(<LessonPage />) },
      { path: 'certificates/:courseId', element: <Certificate /> },
      { path: 'languages', element: <Languages /> },
      { path: 'languages/:id', element: <LanguageDetail /> },
      { path: 'achievements', element: <Achievements /> },
      { path: 'profile', element: <Profile /> },
      { path: 'settings', element: <Settings /> },
      { path: 'account', element: <Account /> },
      { path: 'playground', element: lazyEl(<Playground />) },
      { path: 'challenges', element: <Challenges /> },
      { path: 'docs', element: lazyEl(<Docs />) },
      { path: 'tools', element: lazyEl(<Tools />) },
      { path: 'roadmaps', element: <Roadmaps /> },
      { path: 'roadmaps/:id', element: <RoadmapDetail /> },
      { path: 'projects', element: <GuidedProjects /> },
      { path: 'projects/:id', element: <GuidedProjectDetail /> },
      { path: 'challenges/:id', element: lazyEl(<ChallengePage />) },
      { path: 'glossary', element: <Glossary /> },
      ...inDevelopmentRoutes,
      ...(import.meta.env.DEV ? [{ path: 'dev/content-check', element: lazyEl(<ContentCheck />) }] : []),
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
