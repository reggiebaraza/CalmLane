import { LegalPage } from "@/components/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy">
      <p>
        We built CalmLane so you have a private place to reflect. This page summarizes how data is used in a typical
        self-hosted or team deployment. Your actual practices depend on how you configure Supabase, hosting, and
        analytics.
      </p>
      <h2>What we store</h2>
      <p>
        To run the product, the app stores account information (via Supabase Auth), your profile and preferences, chat
        messages, journal entries, mood logs, coping-tool usage, and minimal safety-related events when elevated-risk
        patterns are detected in chat or journal flows.
      </p>
      <h2>How we use it</h2>
      <ul>
        <li>To provide features you see in the app (e.g. loading your conversations and journal).</li>
        <li>To improve reliability and safety within the product (e.g. crisis resource surfacing).</li>
        <li>We do not sell your journal or chat content to advertisers.</li>
      </ul>
      <h2>Analytics</h2>
      <p>
        If you deploy with Vercel Analytics or similar, aggregated usage metrics may be collected according to that
        provider&apos;s policies. The cookie banner on the marketing site is for transparency; adjust it to match your
        real stack.
      </p>
      <h2>Your choices</h2>
      <p>
        In the app settings you can download a JSON export of your data and request account deletion when the server
        is configured with the appropriate service role key. You can also delete individual chats and journal entries
        from their screens.
      </p>
      <h2>Contact</h2>
      <p>
        For privacy requests, contact the operator of this CalmLane deployment (your team or organization). This
        repository does not operate a single global service on your behalf.
      </p>
    </LegalPage>
  );
}
