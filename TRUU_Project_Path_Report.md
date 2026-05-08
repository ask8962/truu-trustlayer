# TRUU: Development Roadmap & Project Path

> [!NOTE]
> **Project Goal:** Build the MVP for TRUU, a decentralized trust layer that replaces resumes by automatically analyzing a developer's digital exhaust (GitHub) to issue mathematically verifiable "Skill Credentials."
> **Tech Stack:** Next.js (App Router), Tailwind CSS, shadcn/ui, Firebase (Auth + Firestore), Grok/Gemini AI API, Vercel.

---

## 🏁 Phase 1: Frontend MVP & UI "Vibes" (Current Phase)

**Focus:** Establishing the premium, dark-mode, web3-adjacent aesthetic and building the core navigation flow using hardcoded mock data.

### Key Milestones:
- [x] **Landing Page (`/`)**: Implement the hero section, "How it Works" columns, and a glowing mock "Verified Skill Badge."
- [x] **Internal Dashboard (`/dashboard`)**: Build the Bento Box grid layout. Include the "Run Ambient Miner" fake loading state and a table of recently detected skills.
- [x] **Public Capability Passport (`/profile/[username]`)**: Create the high-end digital business card with metallic/glassy "Proof Cards" and mock cryptographic hashes.
- [x] **Routing & State**: Ensure smooth transitions between the landing page, dashboard, and public profiles.

> [!TIP]
> **Vibe Coding Strategy:** Since you are currently executing this phase using the prompt provided, continue leveraging v0.dev, Bolt.new, or Cursor to generate the UI components rapidly. Ensure the `lucide-react` icons and `shadcn/ui` components are properly integrated.

---

## 🔐 Phase 2: Authentication & Database Foundation (Days 1-2)

**Focus:** Moving from mock data to a real backend foundation using Firebase's free tier.

### Key Milestones:
1. **Firebase Project Setup:**
   - Create a new project in the Firebase Console.
   - Enable **Firestore Database** (start in test mode for local dev).
   - Enable **Firebase Authentication** and explicitly turn on the **GitHub OAuth** provider.
2. **Next.js Integration:**
   - Install `firebase` and set up the client SDK initialization in a `lib/firebase.ts` file.
   - Implement a login function on the Landing Page CTA: `signInWithPopup(auth, githubProvider)`.
3. **Data Schema Design:**
   - When a user logs in for the first time, create a document in the `users` collection:
     ```json
     {
       "uid": "123",
       "githubUsername": "anukalp",
       "githubAccessToken": "gho_...", // Crucial for Phase 3
       "trustScore": 0,
       "verifiedSkills": []
     }
     ```

---

## 🧠 Phase 3: The "Ambient Miner" AI Engine (Days 3-5)

**Focus:** Building the core intelligence of TRUU that reads GitHub exhaust and extracts actionable skills.

### Key Milestones:
1. **GitHub API Integration:**
   - Create a Next.js API Route (`/api/mine`).
   - Use the stored `githubAccessToken` to fetch the user's top 3 public repositories, recent commits, and PR descriptions via the GitHub REST API.
2. **LLM Skill Extraction:**
   - Concatenate the GitHub data into a clean text payload.
   - Send the payload to Grok (or Gemini/OpenAI) via API.
   - **System Prompt:** *"You are an expert technical recruiter. Analyze these commits and extract 5 specific technical skills. Return ONLY a JSON array of objects with `skillName` and `proficiencyLevel`."*
3. **Save to Firestore:**
   - Parse the AI's JSON response and append these new skills to the user's `verifiedSkills` array in Firestore.

> [!WARNING]
> Ensure you do not expose your AI API keys on the frontend. All AI calls MUST happen in Next.js API routes or Server Actions.

---

## 🛡️ Phase 4: Credentialing & Verification Logic (Days 6-8)

**Focus:** Making the skills mathematically "unfakeable" for the MVP without needing complex Zero-Knowledge Proof infrastructure.

### Key Milestones:
1. **Server-Signed JWTs (The MVP Proof):**
   - Inside the `/api/mine` route, after the AI extracts a skill, generate a JSON Web Token (JWT) using the `jsonwebtoken` library.
   - Payload: `{ uid: "123", skill: "Rust Memory Safety", timestamp: "..." }`.
   - Sign it with a secret `TRUU_JWT_SECRET` stored in your Vercel environment variables.
2. **Update the Dashboard UI:**
   - Replace the mock data on `/dashboard` by fetching the real `verifiedSkills` from Firestore.
   - When the user clicks the "Run Ambient Miner" button, actually call the `/api/mine` endpoint and show the real loading state.
3. **Proof Visibility:**
   - Add a "View Proof" button to each skill card that opens a modal displaying the raw, signed JWT string (your "mock cryptographic hash" from Phase 1 becomes real).

---

## 🌍 Phase 5: The Public Trust Graph & Virality (Days 9-10)

**Focus:** Letting users show off their skills to employers and creating a viral growth loop.

### Key Milestones:
1. **Dynamic Public Profiles:**
   - Create a dynamic route at `app/profile/[username]/page.tsx`.
   - Query Firestore for the user matching that `githubUsername`.
   - Render the Public Capability Passport using their real verified skills. If the user doesn't exist, show a clean 404 page.
2. **Dynamic OG Images (Crucial for Growth):**
   - Use `next/og` (Next.js ImageResponse) to generate dynamic Open Graph images.
   - When `truu.id/profile/anukalp` is shared on Twitter/LinkedIn, it should automatically render a beautiful image showing your profile picture, your Trust Score, and your top 3 verified skills.

---

## 🚀 Phase 6: Polish, Deploy, and Launch (Days 11-14)

**Focus:** Securing the app and launching to your first batch of users.

### Key Milestones:
1. **Security Rules:**
   - Write Firestore Security Rules so users can only write to their own documents, but public profiles are readable by anyone.
2. **Vercel Deployment:**
   - Connect your GitHub repo to Vercel.
   - Add all environment variables (Firebase config, GitHub OAuth secrets, AI API keys, JWT secret).
   - Deploy to production.
3. **The "Cold Start" Launch:**
   - Onboard 10-20 highly active developers manually. Have them mine their skills and share their dynamic OG image profiles on Twitter to kickstart the viral loop.

---

> [!IMPORTANT]
> **Daily Workflow:** Every day before writing code, explicitly tell your AI assistant which phase and milestone you are working on. This keeps the "vibe coding" focused and prevents the AI from hallucinating unneeded complexity.





Here is a quick overview of the path we laid out for tomorrow and beyond:

Phase 1 (Current): Frontend MVP & UI "Vibes" — Generating the dark-mode, glassmorphic UI using your prompt, with robust mock data.
Phase 2: Authentication & DB — Setting up Firebase and integrating GitHub OAuth to capture the user's access token.
Phase 3: The "Ambient Miner" — Writing the Next.js API route that pulls GitHub commits and feeds them to the Grok API for skill extraction.
Phase 4: Credentialing — Generating Server-Signed JWTs to simulate the cryptographic proof for the MVP.
Phase 5: The Public Trust Graph — Building the dynamic /profile/[username] pages and auto-generating Open Graph images for viral sharing.
Phase 6: Launch — Deploying to Vercel and onboarding the first 10-20 users.