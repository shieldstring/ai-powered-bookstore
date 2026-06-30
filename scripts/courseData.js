const buildLesson = (title, content, duration = "45 min") => ({
  title,
  content,
  duration,
});

const buildModule = (title, lessons) => ({
  title,
  lessons,
});

const COURSE_IMAGES = {
  c3: "https://images.unsplash.com/photo-1506126613408-eca07ce68773.jpg?w=800&q=80",
  teen: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f.jpg?w=800&q=80",
  nomoney: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40.jpg?w=800&q=80",
  student: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173.jpg?w=800&q=80",
  pmhc: "https://images.unsplash.com/photo-1507692049790-de58290a4334.jpg?w=800&q=80",
  fox300: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b.jpg?w=800&q=80",
};

const COURSE_IMAGE = COURSE_IMAGES.c3;

const courses = [
  {
    isbn: "COURSE-C3-CRISIS-TO-CLARITY",
    image: COURSE_IMAGES.c3,
    title: "Crisis to Clarity Course (C3)",
    tag: "Mental Wellness",
    category: "Self-Help",
    price: 79.99,
    originalPrice: 99.99,
    description: `Crisis to Clarity Course (C3): A Transformational Journey to Mental, Emotional, and Spiritual Wholeness.

Find Hope. Find Healing. Find Clarity.

In a time when life feels increasingly fragile and mental health struggles are more common than ever, one truth stands firm: healing is possible.

C3 bridges the eternal truths of Scripture with the best practices of modern clinical psychology. Based on the book Crisis to Clarity, this 6-module course is designed for those ready to move beyond survival into healing, restoration, and renewed purpose.

Whether you're struggling with anxiety, trauma, depression, or seeking clarity amidst emotional chaos, this journey is for you.

What you'll receive:
• Lifetime access to all 6 course modules
• Downloadable healing journal and Scripture therapy templates
• Monthly mental health check-ins and guided reflection videos
• Community access plus Q&A sessions with the author and licensed therapists within your first 6 months of completion

Group and church discounts available. Invite us to speak at your church, retreat, or conference.

"You are not what happened to you. You are who God is healing you to become."`,
    sections: [
      buildModule("Module 1: Understanding the Storm — What is Mental Health, Really?", [
        buildLesson(
          "Understanding the Storm",
          `• Defining mental health through biblical and clinical lenses
• Dispelling myths: faith vs. mental illness
• The soul, the spirit, and the mind — how they interact
• Jesus and the emotionally distressed: case studies in Scripture

Scripture Focus: Psalm 42:11 — "Why art thou cast down, O my soul?… Hope thou in God."`,
          "50 min"
        ),
      ]),
      buildModule("Module 2: From Brokenness to Belief — Depression, Anxiety & Spiritual Identity", [
        buildLesson(
          "From Brokenness to Belief",
          `• Understanding depression and anxiety clinically
• The invisible battles of biblical heroes: Elijah, Job, Paul
• Identity in Christ as a foundation for mental wellness
• The role of CBT, mindfulness, and gratitude practices

Scripture Focus: Isaiah 61:3 — "To give them beauty for ashes… the garment of praise for the spirit of heaviness."`,
          "50 min"
        ),
      ]),
      buildModule("Module 3: Healing the Wounds Within — Trauma, Triggers, and Grace", [
        buildLesson(
          "Healing the Wounds Within",
          `• The science of trauma: fight, flight, freeze explained
• God's response to human suffering in Scripture
• Trauma-informed care and safe emotional spaces
• Biblical journaling and lamenting as healing tools

Scripture Focus: Psalm 147:3 — "He healeth the broken in heart, and bindeth up their wounds."`,
          "50 min"
        ),
      ]),
      buildModule("Module 4: The Power of Thought — Rewiring the Mind through Truth", [
        buildLesson(
          "The Power of Thought",
          `• Renewing your mind: Scripture meets neuroscience
• Replacing lies with truth: affirmation, meditation, journaling
• Understanding neuroplasticity and how your brain changes with belief
• Emotional regulation tools and Biblical confession templates

Scripture Focus: Romans 12:2 — "Be transformed by the renewing of your mind."`,
          "50 min"
        ),
      ]),
      buildModule("Module 5: Restoring Relationships — Forgiveness, Boundaries, and Reconnection", [
        buildLesson(
          "Restoring Relationships",
          `• Emotional health in the context of relationships
• Biblical conflict resolution vs. modern therapy techniques
• Boundaries and self-worth in God
• Reconciliation, community, and healing past wounds

Scripture Focus: Colossians 3:13 — "Forgive one another, if any man have a quarrel…"`,
          "50 min"
        ),
      ]),
      buildModule("Module 6: A Sound Mind — Living Whole, Free, and Empowered", [
        buildLesson(
          "A Sound Mind",
          `• Faith and mental wellness as a lifestyle
• How to create a mental health maintenance plan
• Developing spiritual resilience
• Integrating daily habits of emotional and spiritual care

Scripture Focus: 2 Timothy 1:7 — "God has not given us a spirit of fear… but of a sound mind."`,
          "50 min"
        ),
      ]),
    ],
  },
  {
    isbn: "COURSE-TEEN-WEALTH-BLUEPRINT",
    image: COURSE_IMAGES.teen,
    title: "Teen Wealth Blueprint",
    tag: "Youth Finance",
    category: "Education",
    price: 49.99,
    originalPrice: 69.99,
    description: `Teen Wealth Blueprint: Building Purpose, Power & Prosperity from the Start.

Unlock the Future Now — Not Later.

A transformational faith-based course designed to equip teenagers with timeless financial principles, entrepreneurial strategies, and biblical wisdom to build lasting wealth and meaningful impact starting right now.

This isn't about overnight riches. It's about setting the right foundation. And if you start young, you'll finish strong.

What you'll receive:
• Access to all 5 transformational video modules
• Vision mapping templates and financial planning worksheets
• Printable scripture affirmation cards for daily empowerment
• Bonus: Teen Business Starter Kit
• Access to private community forum and mentorship webinars

Group and church packages available. Contact us for speaker bookings and school partnerships.

Philippians 4:13 — "I can do all things through Christ which strengtheneth me."`,
    sections: [
      buildModule("Module 1: Mindset Over Money", [
        buildLesson(
          "Mindset Over Money",
          `• Why wealth begins in the mind, not the wallet
• How your thoughts shape your financial future
• Battling limiting beliefs with God's truth
• Real stories of teenage millionaires and biblical heroes

Scripture Focus: Proverbs 23:7 — "As a man thinketh in his heart, so is he."`,
          "40 min"
        ),
      ]),
      buildModule("Module 2: Vision, Purpose & the Power of Now", [
        buildLesson(
          "Vision, Purpose & the Power of Now",
          `• Crafting a life vision that aligns with God's plan
• Turning dreams into clear goals and plans
• Joseph's story: the boy with a dream who saved a nation
• Tools for setting and tracking your progress

Scripture Focus: Proverbs 29:18 — "Where there is no vision, the people perish…"`,
          "40 min"
        ),
      ]),
      buildModule("Module 3: Entrepreneurship & Smart Money Habits", [
        buildLesson(
          "Entrepreneurship & Smart Money Habits",
          `• Business ideas you can start today as a teen
• Creating value that attracts income
• Introduction to investing and compound growth
• Why budgeting is cooler than it sounds

Scripture Focus: Proverbs 13:11 — "Wealth gotten by vanity shall be diminished…"`,
          "45 min"
        ),
      ]),
      buildModule("Module 4: Confidence, Resilience & Fear Mastery", [
        buildLesson(
          "Confidence, Resilience & Fear Mastery",
          `• Crushing fear of failure and perfectionism
• What to do when you fail (because you will)
• Building spiritual and mental toughness
• From setbacks to comebacks: real youth testimonies

Scripture Focus: 2 Timothy 1:7 — "For God hath not given us the spirit of fear…"`,
          "40 min"
        ),
      ]),
      buildModule("Module 5: Networking, Leverage & Kingdom Impact", [
        buildLesson(
          "Networking, Leverage & Kingdom Impact",
          `• Why you don't have to do it all alone
• Building relationships that open doors
• Understanding wealth as a tool for influence
• How to turn your gifts into purpose and impact

Scripture Focus: Proverbs 18:16 — "A man's gift maketh room for him…"`,
          "45 min"
        ),
      ]),
    ],
  },
  {
    isbn: "COURSE-NO-MONEY-DOWN",
    image: COURSE_IMAGES.nomoney,
    title: "No Money Down Challenge",
    tag: "Entrepreneurship",
    category: "Business & Economics",
    price: 59.99,
    originalPrice: 79.99,
    description: `No Money Down Challenge: Unlocking Wealth Through Wisdom, Purpose & Divine Strategy.

Discover the secrets to building wealth without starting with money.

Based on the groundbreaking insights from the book "Buying Without Money," this purpose-driven, faith-rooted curriculum challenges the myth that financial capital is the first step to success.

Who this is for:
• Aspiring entrepreneurs without startup capital
• Creatives, visionaries, and dreamers hungry for impact
• Faith-based professionals seeking alignment between purpose and profit
• Change makers looking to build legacy, not just income

What you'll receive:
• Full course access (5 transformational modules)
• Downloadable worksheets and strategy guides
• Lifetime access to course recordings
• Bonus: 30-day Vision Accelerator workbook
• Entry into the Purpose to Profit (IMPACT NETWORK) community forum

Early Bird: First 100 sign-ups get an exclusive one-on-one clarity session with the author at course completion.`,
    sections: [
      buildModule("Module 1: Foundations of Purpose-Driven Wealth", [
        buildLesson(
          "Foundations of Purpose-Driven Wealth",
          `• Understanding the Buying Without Money mindset
• Debunking the capital-first myth
• Biblical models: Joseph, Isaac, and Jesus as strategic thinkers
• Identifying your God-given assets

Key insight: You already have enough to start.`,
          "45 min"
        ),
      ]),
      buildModule("Module 2: The True Currency — Wisdom, Ideas & Relationships", [
        buildLesson(
          "The True Currency",
          `• Why wisdom is more valuable than money (Proverbs 3:13–18)
• Turning creativity into capital
• Cultivating networks that generate opportunities
• The Joseph Strategy: vision, interpretation, and alignment

Key insight: Relationships and insight can attract what money can't buy.`,
          "45 min"
        ),
      ]),
      buildModule("Module 3: Faith as Strategy", [
        buildLesson(
          "Faith as Strategy",
          `• Understanding divine provision vs. human striving
• Building momentum through small, obedient steps
• How to hear and follow God's leading in business and life
• Miraculous multiplication: what Jesus teaches about value and provision

Key insight: Your faith is a strategy, not just a feeling.`,
          "45 min"
        ),
      ]),
      buildModule("Module 4: Building Value Before Wealth", [
        buildLesson(
          "Building Value Before Wealth",
          `• The marketplace reward system: solving problems = income
• Creating value that commands attention and investment
• Leveraging platforms (social, ministry, business) with zero budget
• Kingdom entrepreneurship principles

Key insight: Value creates visibility. Visibility invites provision.`,
          "50 min"
        ),
      ]),
      buildModule("Module 5: Sustainable Impact & Enduring Legacy", [
        buildLesson(
          "Sustainable Impact & Enduring Legacy",
          `• Turning moments into movements
• Designing systems and solutions that outlive you
• Legacy is built by purpose, not profit
• Final project: mapping your "Wealth Without Money" journey

Key insight: Your life can echo beyond your lifetime.`,
          "50 min"
        ),
      ]),
    ],
  },
  {
    isbn: "COURSE-STUDENT-GENIUS-MASTERY",
    image: COURSE_IMAGES.student,
    title: "Student Genius Mastery Course",
    tag: "Academic Success",
    category: "Education",
    price: 69.99,
    originalPrice: 89.99,
    description: `Student Genius Mastery Course — a transformational mentoring experience designed to turn learning limitations into leaping ladders of success.

Inspired by the book Unlikely Genius: How I Outperformed the Best with My Academic Blueprint. This system took a struggling student once labeled "dumb" and transformed him into a First Class graduate.

Who can take this course:
• Students of all levels (high school, undergraduate, postgraduate)
• Individuals with learning difficulties (e.g., dyslexia, ADHD)
• Adult learners and professionals returning to study
• Educators and coaches seeking fresh methodologies
• Anyone pursuing excellence despite early setbacks

Features the proven 30-20-30-20 Strategy for Academic Breakthrough Success.

"Success is not about where you start — it's about how strategically, prayerfully, and persistently you run your race. Even the last can become first."`,
    sections: [
      buildModule("Module 1: Understanding Your Genius (Even If You Don't See It Yet)", [
        buildLesson(
          "Understanding Your Genius",
          `• Unpacking the myth of natural intelligence
• The power of mindset and the Biblical case for growth (Prov. 4:7, Rom. 12:2)
• Identifying your personal learning profile`,
          "45 min"
        ),
      ]),
      buildModule("Module 2: The 30-20-30-20 Learning Framework", [
        buildLesson(
          "The 30-20-30-20 Learning Framework",
          `• How the 30-20-30-20 strategy maximizes limited mental energy
• Creating multiple touchpoints for deep learning
• Leveraging group synergy for academic breakthrough
• Step-by-step implementation of the blueprint`,
          "50 min"
        ),
      ]),
      buildModule("Module 3: Strategic Focus & Time Mastery", [
        buildLesson(
          "Strategic Focus & Time Mastery",
          `• Time-blocking for brilliance
• Smart scheduling for high-impact study
• The "3-Hour Rule" of academic optimization`,
          "45 min"
        ),
      ]),
      buildModule("Module 4: Tools, Templates & Tactics", [
        buildLesson(
          "Tools, Templates & Tactics",
          `• Daily and weekly study planners
• Lecture capture and note conversion techniques
• Group study blueprints for impact`,
          "45 min"
        ),
      ]),
      buildModule("Module 5: Faith + Focus = Fruitfulness", [
        buildLesson(
          "Faith + Focus = Fruitfulness",
          `• Overcoming doubt and discouragement with Scripture
• Developing inner strength through prayer, purpose, and practice
• Biblical keys to intellectual fruitfulness (Dan. 1:17, James 1:5)`,
          "45 min"
        ),
      ]),
      buildModule("Module 6: From Academics to Life Excellence", [
        buildLesson(
          "From Academics to Life Excellence",
          `• Applying the blueprint to business, ministry, and leadership
• Building confidence in your learning process
• Embracing your unique journey`,
          "50 min"
        ),
      ]),
    ],
  },
  {
    isbn: "COURSE-PASTORAL-MENTAL-HEALTH",
    image: COURSE_IMAGES.pmhc,
    title: "Pastoral Mental Health Course (PMHC)",
    tag: "Ministry Leaders",
    category: "Religion & Spirituality",
    price: 89.99,
    originalPrice: 119.99,
    description: `Pastoral Mental Health Course (PMHC): Restoring the Mind, Soul, and Strength of the Minister.

Ministry is a sacred calling but also a heavy burden. Pastors are expected to lead, guide, counsel, preach, manage, serve, and often sacrifice more than they should. But who takes care of the shepherd?

PMHC is a transformative support program for pastors, ministers, and spiritual leaders navigating emotional fatigue, spiritual burnout, and the weight of ongoing pastoral demands. Blending biblical wisdom with psychological insights.

You are called. You are chosen. But you are also human. And now you are invited to heal.

What you'll get:
• 6 core modules (video + workbook)
• Pastoral Burnout Recovery Guide (downloadable PDF)
• Scripture meditation cards for emotional healing
• Prayer and therapy tracker sheet
• Weekly group support and community forum access
• Certificate of completion + bonus masterclass: Mental Health & Ministry Ethics

Next cohort starts 5th September 2025. Church and seminary group rates available.`,
    sections: [
      buildModule("Module 1: The Emotional Weight of the Call", [
        buildLesson(
          "The Emotional Weight of the Call",
          `• Understanding pastoral pressure: expectations, fatigue, and isolation
• The reality of burnout, compassion fatigue, and moral fatigue
• A biblical view of mental struggle

Scripture Focus: 2 Corinthians 4:7 — "But we have this treasure in jars of clay…"`,
          "45 min"
        ),
      ]),
      buildModule("Module 2: Sabbath for the Shepherd", [
        buildLesson(
          "Sabbath for the Shepherd",
          `• Rediscovering rest as a biblical mandate
• Rest vs. "hustle": why busyness isn't godliness
• Creating a sabbath rhythm for sustainable ministry

Scripture Focus: Mark 6:31 — "Come ye yourselves apart… and rest a while."`,
          "40 min"
        ),
      ]),
      buildModule("Module 3: Vulnerability, Honesty, and Emotional Health", [
        buildLesson(
          "Vulnerability, Honesty, and Emotional Health",
          `• Emotional honesty before God and trusted peers
• Building safe spaces in pastoral circles
• Case studies: healing through confession and accountability

Scripture Focus: Psalm 62:8 — "Pour out your hearts to Him…"`,
          "45 min"
        ),
      ]),
      buildModule("Module 4: Prayer, Meditation, and Mental Renewal", [
        buildLesson(
          "Prayer, Meditation, and Mental Renewal",
          `• Using Scripture as a tool for cognitive and emotional re-alignment
• Breath prayers and biblical meditation
• Developing a "mental wellness altar" for daily grounding

Scripture Focus: Philippians 4:6–7 — "And the peace of God… shall guard your hearts and minds."`,
          "45 min"
        ),
      ]),
      buildModule("Module 5: When It Breaks — Depression, Anger & Isolation", [
        buildLesson(
          "When It Breaks",
          `• Recognizing red flags: spiritual apathy, poor decision-making, burnout
• Psychology + Scripture: tools for crisis navigation
• Seeking professional help without losing your calling

Scripture Focus: Psalm 42:11 — "Why art thou cast down, O my soul?"`,
          "50 min"
        ),
      ]),
      buildModule("Module 6: Building Mental Health Culture in Ministry", [
        buildLesson(
          "Building Mental Health Culture in Ministry",
          `• Training church boards and members to support pastors
• Encouraging peer mentorship and sabbatical models
• Leaving a legacy of emotionally healthy ministry

Scripture Focus: Galatians 6:2 — "Bear ye one another's burdens…"`,
          "50 min"
        ),
      ]),
    ],
  },
  {
    isbn: "COURSE-FOX300-CHALLENGE",
    image: COURSE_IMAGES.fox300,
    title: "FOX300 Challenge",
    tag: "90-Day Challenge",
    category: "Self-Help",
    price: 99.99,
    originalPrice: 149.99,
    description: `FOX300 Challenge — Transforming Potential into 300X Productivity in 90 Days.

A powerful, time-bound personal and professional development program designed to help individuals increase productivity, purpose clarity, and impact by 300 times in just 90 days. Rooted in biblical wisdom and refined through evidence-based coaching practices.

Inspired by the fierce precision of Samson's 300 foxes in Judges 15:4 — fast, focused, fiery, and fruitful.

Who is this for:
• Startups and entrepreneurs seeking daily execution strategies
• Church leaders and ministers needing spiritual and strategic clarity
• Business professionals desiring discipline and career acceleration
• Students and creatives exploring purpose and direction
• Executives and thought leaders who need fresh fire and structured accountability

Deliverables:
• 90-day digital workbook with journaling, planning, and growth metrics
• Daily tracker system for mindset, habits, energy, prayer, study, and productivity
• Weekly live coaching calls with Q&A
• Scripture-based frameworks for modern productivity
• Peer accountability pods
• FOXPULSE Scorecard across 7 key growth areas
• Completion certificate and alumni access

Next cohort starts 1st October 2026. Group packages, coaching upgrades, and affiliates available.`,
    sections: [
      buildModule("Dimension 1 — Module 1: Identity & Intention", [
        buildLesson(
          "Identity & Intention",
          `Understand your God-given identity and how to align it with your calling. Explore limiting beliefs, internal blocks, and reset your mind with truth.

Outcome: Build an unshakeable foundation of self-awareness, mental clarity, and spiritual energy.`,
          "60 min"
        ),
      ]),
      buildModule("Dimension 1 — Module 2: Mental Fitness & Resilience", [
        buildLesson(
          "Mental Fitness & Resilience",
          `Tools for emotional regulation, stress management, and developing a success-oriented mindset using prayer, meditation, and cognitive restructuring.`,
          "60 min"
        ),
      ]),
      buildModule("Dimension 1 — Module 3: The Spirit of Productivity", [
        buildLesson(
          "The Spirit of Productivity",
          `Learn how spiritual disciplines (fasting, devotion, consecration) can fuel peak performance and focus.`,
          "60 min"
        ),
      ]),
      buildModule("Dimension 2 — Module 4: Vision Crafting & Goal Architecture", [
        buildLesson(
          "Vision Crafting & Goal Architecture",
          `How to develop and reverse-engineer clear 90-day goals across key areas of life: career, ministry, finances, relationships, and wellness.`,
          "60 min"
        ),
      ]),
      buildModule("Dimension 2 — Module 5: Time Stewardship & Habits of Greatness", [
        buildLesson(
          "Time Stewardship & Habits of Greatness",
          `Learn habit-stacking, time-blocking, and biblical principles of diligence to master your daily calendar.`,
          "60 min"
        ),
      ]),
      buildModule("Dimension 2 — Module 6: Systems Thinking & Productivity Hacks", [
        buildLesson(
          "Systems Thinking & Productivity Hacks",
          `Automate, delegate, and eliminate distractions. Get more done by doing less but smarter.

Outcome: Develop a 90-day life blueprint, daily KPIs, and an execution plan for radical achievement.`,
          "60 min"
        ),
      ]),
      buildModule("Dimension 3 — Module 7: Influence, Leadership & Communication", [
        buildLesson(
          "Influence, Leadership & Communication",
          `Learn to lead yourself and others with conviction, compassion, and clarity. Develop persuasive communication and people skills.`,
          "60 min"
        ),
      ]),
      buildModule("Dimension 3 — Module 8: Financial Mastery & Multiplication", [
        buildLesson(
          "Financial Mastery & Multiplication",
          `Practical principles for stewardship, business building, income diversification, and kingdom-centered wealth creation.`,
          "60 min"
        ),
      ]),
      buildModule("Dimension 3 — Module 9: Legacy Architecture & Personal Branding", [
        buildLesson(
          "Legacy Architecture & Personal Branding",
          `Turn your story into a movement. Package your expertise, life story, or calling into influence platforms, books, businesses, courses, and ministries.

Outcome: Gain a roadmap for long-term impact, financial sustainability, and life beyond success — legacy.`,
          "60 min"
        ),
      ]),
    ],
  },
];

module.exports = {
  courses,
  COURSE_IMAGE,
  COURSE_IMAGES,
};
