export const playerData = {
  name: 'Lucas Lau',
  class: 'Biomedical Engineering Student',
  university: 'University of Waterloo',
  level: 19,
  xp: 6240,
  maxXP: 9500,

  stats: {
    str: 85, // Python & C++
    int: 78, // AI / ML
    dex: 72, // JavaScript, HTML/CSS
    wis: 80, // AutoCAD
    cha: 90, // Leadership & Communication
    lck: 75, // Engineering Design
    sig: 70, // Signal Processing
    prt: 82  // Prototyping
  },
  skills: [
    { id: 'javascript', name: 'JavaScript', level: 4, years: 3, status: 'mastered', category: 'core' },
    { id: 'react', name: 'React', level: 3, years: 2, status: 'mastered', category: 'core' },
    { id: 'nodejs', name: 'Node.js', level: 3, years: 2, status: 'mastered', category: 'core' },
    { id: 'python', name: 'Python', level: 3, years: 2, status: 'mastered', category: 'core' },
    { id: 'sql', name: 'SQL', level: 2, years: 1, status: 'mastered', category: 'core' },
    { id: 'git', name: 'Git', level: 4, years: 4, status: 'mastered', category: 'core' },
    { id: 'express', name: 'Express', level: 2, years: 1, status: 'mastered', category: 'advanced' },
    { id: 'rest', name: 'REST APIs', level: 3, years: 2, status: 'mastered', category: 'advanced' },
    { id: 'd3', name: 'D3.js', level: 1, years: 0.5, status: 'learning', category: 'advanced' },
    { id: 'three', name: 'Three.js', level: 1, years: 0.5, status: 'learning', category: 'advanced' },
    { id: 'vite', name: 'Vite', level: 2, years: 1, status: 'mastered', category: 'advanced' },
    { id: 'docker', name: 'Docker', level: 1, years: 0.5, status: 'learning', category: 'learning' },
    { id: 'typescript', name: 'TypeScript', level: 1, years: 0.5, status: 'learning', category: 'learning' },
    { id: 'nextjs', name: 'Next.js', level: 1, years: 0.5, status: 'learning', category: 'learning' },
    { id: 'postgres', name: 'PostgreSQL', level: 1, years: 0.5, status: 'learning', category: 'learning' }
  ],
  bio: `A rare hybrid class — part engineer, part athlete, part builder of things that probably shouldn't work but do anyway. 

Spawned in Toronto. Currently grinding in Waterloo. 

Known to sleep at 2am, throw a disc at 7am, and somehow show up to both with full HP. Has defeated several impossible deadlines, destroyed many pairs of cleats, and has slain a dragon or two. 

Primary quest: build technology and get employed. 

Secondary quest: touch grass regularly. 

Currently open to side quests, internships, and co-op contracts.`,
  quests: [
    {
      id: 'genai-agent',
      title: 'GenAI Competitive Insights Agent',
      description: 'Built an end-to-end RAG system to scrape and analyze competitor news. Implemented FAISS vector search with sentence-transformers achieving under 50ms query latency across 50+ articles.',
      tech: ['Python', 'RAG', 'FAISS', 'NLP'],
      github: 'https://github.com/lucaslau19/GenAI-Data-Scraper',
      image: '/quest-images/genai.jpg'
    },
    {
      id: 'volleyball-jump',
      title: 'Volleyball Jump Detection Tool',
      description: 'Real-time jump tracking system using OpenCV and MediaPipe Pose for athletic performance analysis. Processes video at 30+ FPS with live overlays and CSV logging.',
      tech: ['Python', 'OpenCV', 'MediaPipe'],
      github: 'https://github.com/lucaslau19/Volleyball-AI-Jumptracker',
      image: '/quest-images/volleyball.jpg'
    },
    {
      id: 'pulse-oximeter',
      title: 'Arduino Pulse Oximeter',
      description: 'Embedded system measuring blood oxygen saturation and heart rate. C++ firmware for sensor interfacing paired with a real-time JavaScript web dashboard.',
      tech: ['C++', 'Arduino', 'JavaScript', 'HTML/CSS'],
      github: 'https://github.com/lucaslau19',
      image: '/quest-images/oximeter.jpg'
    },
    {
      id: 'catan-connect',
      title: 'CatanConnect',
      description: 'Biomedical design project addressing board game accessibility for individuals with essential tremors. Magnet-based stabilization system with two published technical papers.',
      tech: ['Biomedical Design', 'Prototyping', 'User Research'],
      github: '',
      image: '/quest-images/catan.jpg'
    },
    {
      id: 'spike-ai-deca',
      title: 'SPIKE AI Implementation — DECA',
      description: 'Top 10 global finish at DECA ICDC in Orlando. Developed a 20-page AI integration proposal for a sports organization, including stakeholder interviews and a 5-step strategic framework.',
      tech: ['AI Research', 'Strategy', 'Presentation'],
      github: '',
      image: '/quest-images/deca.jpg'
    }
  ],
  social: {
    github: 'https://github.com/lucaslau',
    linkedin: 'https://linkedin.com/in/lucaslau',
    email: 'lucaslau@example.com'
  }
};