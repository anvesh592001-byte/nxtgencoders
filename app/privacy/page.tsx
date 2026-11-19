import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Table } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How NXTGENCODERS collects, uses, stores, shares and deletes your information, and the choices you have.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Data protection"
      title="Privacy Policy"
      description="This policy explains what information NXTGENCODERS collects, why we collect it, how it is stored and protected, who it is shared with, and how you can access or delete it."
      updated="12 November 2026"
      intro={
        <>
          NXTGENCODERS (&ldquo;NXTGENCODERS&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is a student innovation community
          operated for the NIAT network. We designed it to collect as little personal information as possible while
          still letting you post ideas, discuss problems, form project teams, and build a verified contribution record.
          We do not sell your data, we do not run third-party advertising or analytics trackers, and we do not use your
          content to train advertising profiles.
        </>
      }
      sections={[
        {
          heading: "Who we are",
          body: (
            <>
              <p>
                NXTGENCODERS is the data controller for the information described in this policy. The service is operated
                by the NXTGENCODERS team for students of the NIAT network. For any question, request, or complaint about
                privacy, contact us at <strong>[support@nxtgencoders.com]</strong>.
              </p>
              <p>
                This policy applies to the NXTGENCODERS Progressive Web App (the website and its installed app version) and
                to every page within it.
              </p>
            </>
          ),
        },
        {
          heading: "Information you give us",
          body: (
            <>
              <p>We collect the information you type into our forms. Creating an account requires the following:</p>
              <Table
                rows={[
                  ["Full name", "Displayed on your profile and next to your posts", "Required"],
                  ["Email address", "Sign-in identifier and account recovery contact", "Required"],
                  ["Password", "Sign-in credential, stored only as a salted hash by our auth provider", "Required"],
                  ["Section 1–5", "Shows which NIAT group you belong to", "Required"],
                  ["Username", "Your unique public profile handle", "Optional at signup, set later"],
                  ["Profile photo", "Optional avatar on your profile and posts", "Optional"],
                  ["Bio, skills, interests", "Describes your background to other members", "Optional"],
                  ["GitHub, LinkedIn, portfolio links", "Lets other members see your work", "Optional"],
                ]}
              />
              <p>
                We also store the content you create: ideas, problem posts, proposed solutions, votes, comments and
                replies, project tasks and updates, join requests, reports, and competition entries.
              </p>
            </>
          ),
        },
        {
          heading: "Information collected automatically",
          body: (
            <>
              <p>When you use the service, our systems record a limited amount of technical information:</p>
              <ul>
                <li><strong>Session cookies</strong> set by our authentication provider, which keep you signed in and expire when you log out or when your refresh token is invalidated.</li>
                <li><strong>Theme preference</strong> (dark/light and accent colour) saved in your browser&rsquo;s local storage so the app looks the way you left it.</li>
                <li><strong>Unsaved idea drafts</strong>, kept only in your browser&rsquo;s session storage to protect what you typed if your session expires. These never reach our servers until you submit.</li>
                <li><strong>Security and abuse-prevention records</strong>: rate-limit counters and authentication failure events (error category, HTTP status, and timestamp only — never passwords or tokens).</li>
              </ul>
              <p>
                We do not use advertising cookies, cross-site trackers, fingerprinting, or third-party analytics that
                profile you.
              </p>
            </>
          ),
        },
        {
          heading: "How we use your information",
          body: (
            <>
              <p>We use your information only to run the community:</p>
              <ul>
                <li>To create and secure your account, sign you in, and keep your session alive.</li>
                <li>To publish the content you choose to post and attribute it to you.</li>
                <li>To let other members find you by name or username, and to show your public contribution record.</li>
                <li>To review registrations and approve access, and to moderate content and enforce our Terms of Service.</li>
                <li>To prevent spam, abuse, and unauthorised access through rate limits and audit logging.</li>
                <li>To let an administrator help you recover access to your account if you lose your password.</li>
              </ul>
              <p>
                We never use your information for advertising, and we do not sell, rent, or trade it. We do not include
                third-party ad SDKs in the app.
              </p>
            </>
          ),
        },
        {
          heading: "Legal bases for processing",
          body: (
            <>
              <p>
                Where data-protection law requires us to identify a legal basis, we rely on: <strong>performance of a
                contract</strong> (providing the community you registered for), <strong>legitimate interests</strong>
                (keeping the service secure, preventing abuse, and moderating content), <strong>consent</strong> (optional
                profile details and links you choose to publish), and <strong>legal obligation</strong> where we must
                retain or disclose records. You may withdraw consent for optional details at any time by removing them
                from your profile.
              </p>
            </>
          ),
        },
        {
          heading: "Who can see your information",
          body: (
            <>
              <p>
                <strong>Other members</strong> can see your full name, username, profile photo, bio, skills, interests,
                external links, section-independent contribution points, achievements, and everything you post publicly
                — plus your vote and comment activity where the interface displays it.
              </p>
              <p>
                <strong>Administrators and Chiefs</strong> can see your profile record, approval status, role, reports filed
                against your content, and account-recovery requests. They cannot see your password.
              </p>
              <p>
                <strong>Nobody else</strong> receives your data. Your email address, password hash, session tokens, and
                private settings are not shown to other members.
              </p>
            </>
          ),
        },
        {
          heading: "Service providers",
          body: (
            <>
              <p>We use a small number of infrastructure providers to run the service:</p>
              <ul>
                <li><strong>Supabase</strong> — authentication, PostgreSQL database, file storage, and realtime updates.</li>
                <li><strong>Vercel</strong> — hosting and delivery of the application.</li>
                <li><strong>Google Fonts</strong> — web fonts requested when a page loads.</li>
              </ul>
              <p>
                These providers process data on our behalf under their own data-processing terms and do not receive
                permission to use it for their own marketing. Because Supabase and Vercel operate globally, your data may
                be processed in countries other than your own; both providers maintain standard contractual safeguards
                for international transfers.
              </p>
            </>
          ),
        },
        {
          heading: "Security",
          body: (
            <>
              <p>
                We protect your data with row-level security enforced inside the database, server-side authorisation
                checks on every action, encrypted transport (HTTPS), hashed and salted passwords, scoped file-storage
                rules, and audit logging that records error categories without ever recording passwords, tokens, or
                secrets.
              </p>
              <p>
                No online service is perfectly secure. If we become aware of a breach affecting your personal data, we
                will notify affected members and the relevant authority as required by law.
              </p>
            </>
          ),
        },
        {
          heading: "Retention",
          body: (
            <>
              <p>
                We keep your account and content for as long as your account exists. When you ask us to delete your
                account, we delete your profile, uploaded files, and the content you own, except where we must keep
                limited records to comply with the law, resolve disputes, or prevent abuse. Rate-limit and security
                logs are short-lived and automatically superseded.
              </p>
              <p>
                Content you posted may remain visible in copies held by other members or in backups for a short period
                after deletion before those copies are overwritten.
              </p>
            </>
          ),
        },
        {
          heading: "Your rights and choices",
          body: (
            <>
              <p>You can exercise the following rights at any time:</p>
              <ul>
                <li><strong>Access and export</strong> — request a copy of the personal data we hold about you.</li>
                <li><strong>Correction</strong> — edit your name, username, bio, skills, interests, and links from Settings.</li>
                <li><strong>Deletion</strong> — request deletion of your account and content.</li>
                <li><strong>Objection and restriction</strong> — ask us to stop or limit certain processing.</li>
                <li><strong>Withdraw consent</strong> — remove optional profile details at any time.</li>
              </ul>
              <p>
                Send requests to <strong>[support@nxtgencoders.com]</strong>. We respond within 30 days and may ask you to
                verify that you control the account. If you are not satisfied, you may complain to your local
                data-protection authority.
              </p>
            </>
          ),
        },
        {
          heading: "Account deletion",
          body: (
            <>
              <p>
                You can request deletion by emailing <strong>[support@nxtgencoders.com]</strong> from the address linked to
                your account, or by asking an administrator through the in-app account recovery channel. Deletion removes
                your profile, avatar, and owned content. It is permanent and cannot be undone.
              </p>
              <p>
                You may also ask an administrator to delete a pending recovery request if you submitted one in error.
                Password recovery is administrator-assisted and never requires you to email us a password.
              </p>
            </>
          ),
        },
        {
          heading: "Children",
          body: (
            <>
              <p>
                NXTGENCODERS is a general-audience community intended for students in higher education. It is not directed
                to children under 13, and we do not knowingly collect personal information from children under 13. If you
                believe a child under 13 has created an account, contact us and we will delete it.
              </p>
            </>
          ),
        },
        {
          heading: "Changes to this policy",
          body: (
            <>
              <p>
                If we change how we handle personal data, we will update this page and revise the &ldquo;last
                updated&rdquo; date above. Material changes will be announced in the app. Continuing to use
                NXTGENCODERS after a change means you accept the updated policy.
              </p>
            </>
          ),
        },
      ]}
      footer={
        <>
          <p className="font-display text-sm font-black uppercase tracking-tight text-zinc-200">Contact us</p>
          <p className="mt-2">
            Questions, access requests, deletion requests, or complaints:{" "}
            <a href="mailto:support@nxtgencoders.com"><strong>[support@nxtgencoders.com]</strong></a>
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            Related: <Link href="/terms">Terms of Service</Link>
          </p>
        </>
      }
    />
  );
}
