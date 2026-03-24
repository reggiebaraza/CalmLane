import { LegalPage } from "@/components/legal-page";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use">
      <p>
        These terms describe use of the CalmLane application. If you deploy CalmLane yourself, you are responsible for
        publishing terms that fit your jurisdiction and audience; this text is a sensible baseline, not legal advice.
      </p>
      <h2>The service</h2>
      <p>
        CalmLane provides AI-assisted emotional support tools for reflection and coping. It is not medical care,
        therapy, or emergency services. You must be old enough to enter a binding agreement where you live, or use the
        app with a parent or guardian&apos;s permission if required.
      </p>
      <h2>Acceptable use</h2>
      <ul>
        <li>Use the app personally and do not attempt to access other users&apos; data.</li>
        <li>Do not use the app to harass others, generate harmful instructions, or break the law.</li>
        <li>Do not rely on the app as your only support if you are unsafe — use real-world help.</li>
      </ul>
      <h2>Accounts and data</h2>
      <p>
        You are responsible for keeping your login secure. You may delete your account and certain content through the
        product where enabled. Back up anything important; we are not liable for data loss from misconfiguration or
        third-party infrastructure.
      </p>
      <h2>Disclaimer of warranties</h2>
      <p>
        The app is provided &quot;as is&quot; without warranties of any kind. AI output may be wrong or unhelpful. To
        the fullest extent permitted by law, operators disclaim liability for damages arising from use of the app,
        except where prohibited.
      </p>
      <h2>Changes</h2>
      <p>
        We may update these terms as the product evolves. Continued use after changes constitutes acceptance of the
        updated terms where allowed by law.
      </p>
    </LegalPage>
  );
}
