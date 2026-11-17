/**
 * Career roadmaps. Each milestone links to things that exist on CodeVerse (courses,
 * challenges, projects, languages) and/or a trusted free external resource.
 * A milestone with courses is done automatically when those courses are complete;
 * others are ticked off by the learner.
 */
export interface Milestone {
  id: string;
  title: string;
  why: string;
  skills: string[];
  courses?: string[];
  projects?: string[];
  challenges?: string[];
  languages?: string[];
  external?: { label: string; url: string }[];
}

export interface Roadmap {
  id: string;
  title: string;
  summary: string;
  languages: string[];
  prerequisites: string;
  milestones: Milestone[];
}

const MDN = (path: string, label: string) => ({ label: `MDN: ${label}`, url: `https://developer.mozilla.org/en-US/docs/${path}` });

const webBasics: Milestone[] = [
  { id: 'how-code-works', title: 'How code and the web work', why: 'Everything else builds on knowing what browsers, servers and code are.', skills: ['What programming is', 'Browsers and servers', 'Reading errors'], courses: ['start-here'] },
  { id: 'html', title: 'HTML structure', why: 'Every web page starts as HTML.', skills: ['Tags and attributes', 'Semantic layout', 'Forms and accessibility'], courses: ['html-foundations'], languages: ['html'] },
  { id: 'css', title: 'CSS styling and layout', why: 'Makes pages usable and good-looking on every screen.', skills: ['Selectors and the cascade', 'Box model', 'Flexbox'], courses: ['css-foundations'], projects: ['portfolio', 'landing-page'], languages: ['css'] },
  { id: 'js', title: 'JavaScript fundamentals', why: 'The language of the browser — and of many servers.', skills: ['Variables and types', 'Conditions and loops', 'Functions, arrays, objects'], courses: ['js-foundations'], challenges: ['js-fizzbuzz', 'js-palindrome'], languages: ['javascript'] },
];

export const ROADMAPS: Roadmap[] = [
  {
    id: 'frontend',
    title: 'Frontend Developer',
    summary: 'Build the parts of websites and apps that people see and use.',
    languages: ['html', 'css', 'javascript', 'typescript', 'react'],
    prerequisites: 'None — start from zero.',
    milestones: [
      ...webBasics,
      { id: 'dom', title: 'The DOM and events', why: 'Make pages respond to clicks and typing.', skills: ['Selecting elements', 'Event listeners', 'Updating the page'], projects: ['todo', 'calculator'], external: [MDN('Learn_web_development/Core/Scripting/DOM_scripting', 'DOM scripting')] },
      { id: 'data', title: 'Working with data', why: 'Real apps transform lists and JSON all day.', skills: ['map / filter / reduce', 'Destructuring and spread', 'JSON'], courses: ['js-working-with-data'], challenges: ['js-group-by', 'js-cart-total'] },
      { id: 'async', title: 'Fetching data (async)', why: 'Load data from APIs without freezing the page.', skills: ['Promises', 'async / await', 'fetch and error handling'], projects: ['weather'], external: [MDN('Learn_web_development/Extensions/Async_JS', 'Asynchronous JavaScript')] },
      { id: 'git', title: 'Git and GitHub', why: 'Every team uses version control.', skills: ['Commits and branches', 'Pull requests', 'Publishing a site'], external: [{ label: 'GitHub Skills (free courses)', url: 'https://skills.github.com/' }] },
      { id: 'ts', title: 'TypeScript', why: 'Catches mistakes before your users do.', skills: ['Types and interfaces', 'Typing functions', 'Generics basics'], languages: ['typescript'], external: [{ label: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' }] },
      { id: 'react', title: 'A framework: React', why: 'Most frontend jobs use a component framework.', skills: ['Components and props', 'State and effects', 'Lists and forms'], languages: ['react'], external: [{ label: 'react.dev — Learn', url: 'https://react.dev/learn' }] },
      { id: 'a11y-perf', title: 'Accessibility and performance', why: 'Professional sites work for everyone and load fast.', skills: ['Keyboard and screen readers', 'Responsive images', 'Measuring with Lighthouse'], external: [MDN('Learn_web_development/Core/Accessibility', 'Accessibility')] },
    ],
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    summary: 'Build the servers, APIs and databases behind apps.',
    languages: ['javascript', 'nodejs', 'python', 'sql', 'postgresql'],
    prerequisites: 'Comfortable with the basics of one programming language.',
    milestones: [
      webBasics[0],
      webBasics[3],
      { id: 'sql', title: 'Databases and SQL', why: 'Almost every backend stores data in a database.', skills: ['SELECT, WHERE, ORDER BY', 'JOINs', 'GROUP BY and aggregates'], challenges: ['sql-london', 'sql-revenue', 'sql-top-category'], languages: ['sql'] },
      { id: 'http', title: 'HTTP and REST APIs', why: 'APIs are how frontends, apps and services talk.', skills: ['Requests and responses', 'Status codes', 'REST design'], external: [MDN('Web/HTTP/Overview', 'HTTP overview')] },
      { id: 'node', title: 'A server runtime: Node.js', why: 'Run JavaScript on a server to build APIs.', skills: ['Modules and npm', 'Building an HTTP API', 'Environment variables and secrets'], languages: ['nodejs'], external: [{ label: 'Node.js — Learn', url: 'https://nodejs.org/en/learn' }] },
      { id: 'auth', title: 'Authentication and security', why: 'Protecting users’ data is non-negotiable.', skills: ['Passwords and OAuth', 'Sessions and tokens', 'OWASP Top 10'], external: [{ label: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/' }] },
      { id: 'deploy', title: 'Deploying and monitoring', why: 'Code isn’t done until it runs reliably for users.', skills: ['Hosting', 'Logs and errors', 'CI basics'] },
    ],
  },
  {
    id: 'fullstack',
    title: 'Full-Stack Developer',
    summary: 'Build complete products, from the database to the button.',
    languages: ['html', 'css', 'javascript', 'typescript', 'react', 'nodejs', 'sql'],
    prerequisites: 'None — but it is the longest path. Frontend first is a good plan.',
    milestones: [
      ...webBasics,
      { id: 'data', title: 'Working with data', why: 'Shared by both ends of the stack.', skills: ['Array methods', 'JSON'], courses: ['js-working-with-data'] },
      { id: 'sql', title: 'SQL and data modelling', why: 'Design the data your app depends on.', skills: ['Tables and keys', 'JOINs', 'Aggregates'], challenges: ['sql-revenue'], languages: ['sql'] },
      { id: 'api', title: 'Build an API', why: 'Connect your frontend to your data.', skills: ['HTTP', 'REST', 'Validation'], languages: ['nodejs'] },
      { id: 'react', title: 'React frontend', why: 'Build the UI of your full-stack app.', skills: ['Components', 'State', 'Fetching data'], languages: ['react'] },
      { id: 'ship', title: 'Ship a full-stack project', why: 'A deployed project proves you can do the job.', skills: ['Auth', 'Deploying', 'Iterating with feedback'], projects: ['notes'] },
    ],
  },
  {
    id: 'python',
    title: 'Python Developer',
    summary: 'Use Python for automation, scripts, backends and data.',
    languages: ['python', 'sql'],
    prerequisites: 'None.',
    milestones: [
      webBasics[0],
      { id: 'py-basics', title: 'Python basics', why: 'Readable syntax makes Python a great first language.', skills: ['Variables and types', 'Lists, dicts, loops', 'Functions'], challenges: ['py-even-squares', 'py-fix-countdown'], languages: ['python'], external: [{ label: 'The official Python tutorial', url: 'https://docs.python.org/3/tutorial/' }] },
      { id: 'py-data', title: 'Working with data in Python', why: 'Counting, grouping and cleaning data is everyday Python.', skills: ['Comprehensions', 'Dictionaries', 'Files and CSV'], challenges: ['py-word-count', 'py-fibonacci'] },
      { id: 'py-tools', title: 'Tooling: venv, pip, testing', why: 'Professional Python uses isolated environments and tests.', skills: ['Virtual environments', 'pip', 'pytest'] },
      { id: 'py-web', title: 'Web or automation', why: 'Pick a direction: a web framework or scripting real tasks.', skills: ['Flask/FastAPI basics', 'Calling APIs', 'Automating files'] },
    ],
  },
  {
    id: 'data-science',
    title: 'Data Scientist',
    summary: 'Turn data into answers with statistics, SQL and Python.',
    languages: ['python', 'sql', 'r'],
    prerequisites: 'Python basics help a lot.',
    milestones: [
      { id: 'py-basics', title: 'Python basics', why: 'The main language of data science.', skills: ['Lists and dicts', 'Functions', 'Loops'], challenges: ['py-even-squares', 'py-word-count'], languages: ['python'] },
      { id: 'sql', title: 'SQL for analysis', why: 'Most data lives in databases.', skills: ['Filtering', 'JOINs', 'GROUP BY / HAVING'], challenges: ['sql-cheap-products', 'sql-revenue', 'sql-top-category'], languages: ['sql'] },
      { id: 'stats', title: 'Statistics fundamentals', why: 'Know when a result is real and when it’s noise.', skills: ['Mean, median, spread', 'Distributions', 'Correlation vs causation'], external: [{ label: 'Khan Academy: Statistics', url: 'https://www.khanacademy.org/math/statistics-probability' }] },
      { id: 'pandas', title: 'pandas and visualisation', why: 'The standard toolkit for exploring data.', skills: ['DataFrames', 'Cleaning data', 'Charts'], external: [{ label: 'pandas: getting started', url: 'https://pandas.pydata.org/docs/getting_started/index.html' }] },
      { id: 'ml-intro', title: 'Intro to machine learning', why: 'Prediction models are part of the toolkit.', skills: ['Train/test split', 'Regression and classification', 'Evaluating models'] },
    ],
  },
  {
    id: 'ai-ml',
    title: 'AI / ML Developer',
    summary: 'Build applications powered by machine learning and AI models.',
    languages: ['python'],
    prerequisites: 'Python, and comfort with basic maths.',
    milestones: [
      { id: 'py-basics', title: 'Python fluency', why: 'Nearly all AI tooling is Python-first.', skills: ['Data structures', 'Functions', 'Packages'], challenges: ['py-fibonacci', 'py-word-count'], languages: ['python'] },
      { id: 'math', title: 'Maths for ML', why: 'Understand what models actually do.', skills: ['Vectors and matrices', 'Probability', 'Gradients (intuition)'], external: [{ label: '3Blue1Brown: Neural networks', url: 'https://www.3blue1brown.com/topics/neural-networks' }] },
      { id: 'ml', title: 'Classic machine learning', why: 'Many problems don’t need deep learning.', skills: ['scikit-learn', 'Features', 'Evaluation'] },
      { id: 'dl', title: 'Deep learning', why: 'The basis of modern AI.', skills: ['Neural networks', 'Training loops', 'PyTorch basics'] },
      { id: 'llm-apps', title: 'Building with AI APIs', why: 'Ship products on top of large language models.', skills: ['Prompting', 'Tool use', 'Evaluating outputs', 'Keeping API keys server-side'] },
    ],
  },
  {
    id: 'mobile',
    title: 'Mobile Developer',
    summary: 'Build apps for iOS and Android.',
    languages: ['javascript', 'react', 'kotlin', 'swift', 'dart'],
    prerequisites: 'Programming basics.',
    milestones: [
      webBasics[3],
      { id: 'pick', title: 'Pick a platform', why: 'Native (Swift/Kotlin) or cross-platform (React Native/Flutter).', skills: ['Trade-offs', 'Tooling setup'], languages: ['swift', 'kotlin', 'dart', 'react'] },
      { id: 'ui', title: 'Mobile UI', why: 'Small screens and touch need different design.', skills: ['Layouts', 'Navigation', 'Accessibility'] },
      { id: 'data', title: 'Data and APIs', why: 'Apps sync with servers and work offline.', skills: ['Fetching data', 'Local storage', 'Offline-first basics'], courses: ['js-working-with-data'] },
      { id: 'publish', title: 'Publishing', why: 'Ship to the App Store and Google Play.', skills: ['Signing', 'Store listings', 'Updates'] },
    ],
  },
  {
    id: 'game',
    title: 'Game Developer',
    summary: 'Make games — from browser games to engines like Unity and Godot.',
    languages: ['javascript', 'csharp', 'cpp', 'lua'],
    prerequisites: 'Programming basics.',
    milestones: [
      webBasics[3],
      { id: 'loop', title: 'The game loop', why: 'Every game updates and draws many times a second.', skills: ['Update / render', 'Input handling', 'Timing'], projects: ['game'] },
      { id: 'math', title: 'Game maths', why: 'Movement, collisions and physics need geometry.', skills: ['Vectors', 'Collision detection', 'Randomness'] },
      { id: 'engine', title: 'A game engine', why: 'Engines handle rendering, physics and assets.', skills: ['Godot (GDScript) or Unity (C#)', 'Scenes', 'Scripting'], languages: ['csharp', 'lua'], external: [{ label: 'Godot: Getting started', url: 'https://docs.godotengine.org/en/stable/getting_started/introduction/index.html' }] },
      { id: 'ship', title: 'Finish and share a game', why: 'Finishing small games teaches more than starting big ones.', skills: ['Scope', 'Polish', 'Publishing on itch.io'] },
    ],
  },
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    summary: 'Strong general foundations: algorithms, design and teamwork.',
    languages: ['javascript', 'python', 'java', 'cpp', 'sql'],
    prerequisites: 'Fluency in one language.',
    milestones: [
      webBasics[3],
      { id: 'dsa', title: 'Data structures and algorithms', why: 'Choose the right tool and reason about speed.', skills: ['Arrays, maps, stacks', 'Recursion', 'Big-O'], challenges: ['js-balanced-brackets', 'js-two-sum', 'js-flatten', 'js-roman'] },
      { id: 'debugging', title: 'Debugging and testing', why: 'Professionals spend much of their time here.', skills: ['Reading errors', 'Unit tests', 'Edge cases'], challenges: ['js-debug-average', 'js-debug-max', 'py-fix-countdown'] },
      { id: 'design', title: 'Software design', why: 'Code that’s easy to change is the real goal.', skills: ['Functions and modules', 'Naming', 'Separation of concerns'] },
      { id: 'git', title: 'Git and code review', why: 'Engineering is a team sport.', skills: ['Branches', 'Pull requests', 'Reviewing code'] },
      { id: 'systems', title: 'Systems basics', why: 'Know what happens under your code.', skills: ['Memory', 'Processes and threads', 'Networks'], languages: ['c'] },
    ],
  },
  {
    id: 'security',
    title: 'Cybersecurity Fundamentals',
    summary: 'Understand how systems are attacked and how to defend them.',
    languages: ['bash', 'python', 'javascript', 'sql'],
    prerequisites: 'Comfort with computers; programming basics help.',
    milestones: [
      webBasics[0],
      { id: 'networks', title: 'Networking basics', why: 'Attacks and defences travel over networks.', skills: ['IP, DNS, ports', 'HTTP and TLS', 'Firewalls'], external: [MDN('Web/HTTP/Overview', 'HTTP overview')] },
      { id: 'linux', title: 'Linux and the command line', why: 'Most servers and security tools live here.', skills: ['Files and permissions', 'Processes', 'Shell scripting'], languages: ['bash'] },
      { id: 'web-sec', title: 'Web security', why: 'The web is the biggest attack surface.', skills: ['XSS and injection', 'Authentication flaws', 'OWASP Top 10'], languages: ['sql'], external: [{ label: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/' }] },
      { id: 'scripting', title: 'Security scripting', why: 'Automate checks and analysis.', skills: ['Python scripts', 'Parsing logs'], languages: ['python'] },
      { id: 'practice', title: 'Legal practice labs', why: 'Only practise on systems you’re allowed to test.', skills: ['CTFs', 'Responsible disclosure'], external: [{ label: 'OWASP Juice Shop (practice app)', url: 'https://owasp.org/www-project-juice-shop/' }] },
    ],
  },
  {
    id: 'devops',
    title: 'DevOps Engineer',
    summary: 'Automate how software is built, tested, deployed and run.',
    languages: ['bash', 'python', 'go'],
    prerequisites: 'Programming basics and the command line.',
    milestones: [
      { id: 'linux', title: 'Linux and shell scripting', why: 'The foundation of every server.', skills: ['Shell', 'Permissions', 'Scripting'], languages: ['bash', 'powershell'] },
      { id: 'git', title: 'Git workflows', why: 'Everything starts from version control.', skills: ['Branching strategies', 'Pull requests'] },
      { id: 'ci', title: 'CI/CD pipelines', why: 'Test and deploy automatically on every change.', skills: ['GitHub Actions', 'Automated tests', 'Deploy previews'] },
      { id: 'containers', title: 'Containers', why: 'Run the same software everywhere.', skills: ['Docker images', 'Compose', 'Registries'], external: [{ label: 'Docker: Get started', url: 'https://docs.docker.com/get-started/' }] },
      { id: 'cloud', title: 'Cloud and infrastructure as code', why: 'Manage servers with code, not clicks.', skills: ['A cloud provider', 'Terraform basics', 'Monitoring'] },
    ],
  },
];

export const getRoadmap = (id: string) => ROADMAPS.find((r) => r.id === id);
