import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for using NXTGENCODERS: your account, acceptable use, content ownership, moderation and termination.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Community rules"
      title="Terms of Service"
      description="These terms form the agreement between you and NXTGENCODERS. By creating an account or using the app, you accept them."
      updated="12 November 2026"
      intro={
        <>
          NXTGENCODERS is an invitation-moderated innovation community for NIAT students. Registration creates your
          account immediately, but access is granted only after an administrator approves your profile. These terms
          explain what you may post, what you own, how moderation works, and how the agreement ends.
        </>
      }
      sections={[
        {
          heading: "Acceptance of these terms",
          body: (
            <>
              <p>
                By registering for or using NXTGENCODERS you agree to these Terms of Service and to our{" "}
                <Link href="/privacy">Privacy Policy</Link>. If you do not agree, do not create an account or use the app.
              </p>
            </>
          ),
        },
        {
          heading: "Eligibility and your account",
          body: (
            <>
              <p>
                You must be at least 13 years old to use NXTGENCODERS, and you must be a member of the NIAT network or
                have a legitimate reason to participate. You must provide accurate information about yourself when you
                register, including your full name, email address, and section.
              </p>
              <p>
                You are responsible for keeping your password confidential and for all activity under your account. If
                you believe someone has accessed your account, contact an administrator immediately. You may keep only
                one account per person; duplicate accounts may be removed without notice.
              </p>
            </>
          ),
        },
        {
          heading: "Approval, roles and access levels",
          body: (
            <>
              <p>
                New accounts are registered instantly but marked pending. An administrator reviews each profile and
                approves or rejects access. Until approval, you cannot post content.
              </p>
              <p>
                The community has four roles: <strong>Student</strong>, <strong>Moderator</strong>,{" "}
                <strong>Admin</strong>, and <strong>Chief</strong>. Roles date from an administrator decision and are
                not yours to set, request, or acquire. Attempting to grant yourself elevated permissions, edit role
                fields directly, or bypass approval is a breach of these terms and may end your access.
              </p>
            </>
          ),
        },
        {
          heading: "Acceptable use",
          body: (
            <>
              <p>You agree to use NXTGENCODERS only for constructive, honest participation. You must not:</p>
              <ul>
                <li>Post unlawful, defamatory, harassing, hateful, sexually explicit, or violent content.</li>
                <li>Impersonate another person, or misrepresent your affiliation or authority.</li>
                <li>Post spam, unsolicited promotion, referral links, or repetitive content.</li>
                <li>Upload malware, exploit payloads, or code designed to disrupt the service.</li>
                <li>Attempt to access other members&rsquo; accounts, records, or private data.</li>
                <li>Probe, scan, or attack the platform, or bypass rate limits, approval checks, or database policies.</li>
                <li>Use automated scraping, bots, or bulk extraction of member data without written permission.</li>
                <li>Plagiarise others&rsquo; work, or post content you do not have the right to share.</li>
                <li>Share another person&rsquo;s personal information without their consent.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "Your content and ownership",
          body: (
            <>
              <p>
                You keep full ownership of the ideas, problems, solutions, comments, project material, and files you
                post. By posting, you grant NXTGENCODERS a non-exclusive, worldwide, royalty-free licence to host, store,
                display, format, and distribute that content within the app so that the community can read and respond
                to it.
              </p>
              <p>
                You confirm that you have the rights needed to post your content, and that it does not infringe anyone
                else&rsquo;s intellectual property. The licence ends when you delete the content or your account, except
                for copies already cached, quoted by other members, or retained in backups for a short period.
              </p>
            </>
          ),
        },
        {
          heading: "Our content and licence to you",
          body: (
            <>
              <p>
                The NXTGENCODERS name, logo, interface, design system, and original site content belong to us or our
                licensors. We give you a personal, non-transferable, revocable licence to use the app for its intended
                purpose. You may not copy the interface, resell access, or use the branding to suggest endorsement
                without written permission.
              </p>
            </>
          ),
        },
        {
          heading: "Moderation and enforcement",
          body: (
            <>
              <p>
                Moderators, Admins, and Chiefs may review reported content, edit or remove content that breaks these
                terms, mark reports resolved, and suspend or terminate accounts. Content may be removed at our
                discretion where it damages the community or creates legal risk.
              </p>
              <p>
                You can report content from within the app. We will review reports, but we do not guarantee a particular
                outcome or timescale, and enforcement decisions are final.
              </p>
            </>
          ),
        },
        {
          heading: "Contribution points and achievements",
          body: (
            <>
              <p>
                Contribution points, leaderboard positions, achievements, and competition outcomes are recognition only.
                They carry no monetary value, are not transferable, and may be corrected by administrators if we find
                manipulation, double counting, or errors.
              </p>
            </>
          ),
        },
        {
          heading: "Third-party services and links",
          body: (
            <>
              <p>
                The app relies on Supabase and Vercel to run, and profiles may contain links to GitHub, LinkedIn, or
                personal portfolios. We do not control third-party sites and are not responsible for their content,
                security, or privacy practices. Follow those links at your own risk.
              </p>
            </>
          ),
        },
        {
          heading: "Availability and changes to the service",
          body: (
            <>
              <p>
                We aim to keep NXTGENCODERS available but do not guarantee uninterrupted service. Features may change,
                be added, or be removed as the community evolves, including maintenance downtime. We are not liable for
                loss caused by outages, data unavailability, or changes to features.
              </p>
            </>
          ),
        },
        {
          heading: "Termination",
          body: (
            <>
              <p>
                You may stop using the service at any time and request deletion of your account. We may suspend or
                terminate your access if you breach these terms, attempt to bypass security, or harm other members or
                the platform. Where it is safe and lawful to do so, we will tell you the reason.
              </p>
              <p>
                Sections covering content ownership, disclaimers, limitation of liability, and governing law survive
                termination.
              </p>
            </>
          ),
        },
        {
          heading: "Disclaimers and limitation of liability",
          body: (
            <>
              <p>
                NXTGENCODERS is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any
                kind, express or implied, including fitness for a particular purpose. To the fullest extent permitted by
                law, we are not liable for indirect, incidental, special, or consequential damages, or for lost data,
                reputation, or opportunity arising from your use of the app.
              </p>
              <p>
                Nothing in these terms limits liability that cannot be limited by law, including liability for fraud or
                for death or personal injury caused by negligence.
              </p>
            </>
          ),
        },
        {
          heading: "Governing law and changes",
          body: (
            <>
              <p>
                These terms are governed by the laws of India, and the courts of Andhra Pradesh have exclusive
                jurisdiction over any dispute, unless mandatory consumer law in your country provides otherwise.
              </p>
              <p>
                We may update these terms as the service changes. Material changes will be announced in the app and the
                &ldquo;last updated&rdquo; date above will change. Continuing to use NXTGENCODERS after an update means
                you accept the revised terms.
              </p>
            </>
          ),
        },
      ]}
      footer={
        <>
          <p className="font-display text-sm font-black uppercase tracking-tight text-zinc-200">Contact us</p>
          <p className="mt-2">
            Questions about these terms:{" "}
            <a href="mailto:support@nxtgencoders.com"><strong>[support@nxtgencoders.com]</strong></a>
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            Related: <Link href="/privacy">Privacy Policy</Link>
          </p>
        </>
      }
    />
  );
}
