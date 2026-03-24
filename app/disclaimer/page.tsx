import { LegalPage } from "@/components/legal-page";

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer">
      <p>
        CalmLane is software that offers AI-assisted emotional support, reflection prompts, journaling, mood check-ins,
        and guided coping exercises. It is designed for general wellness and self-reflection, not for diagnosing,
        treating, or preventing any medical or mental health condition.
      </p>
      <h2>Not professional care</h2>
      <p>
        CalmLane is not therapy, counseling, psychiatry, psychology, or any other licensed professional service.
        Nothing in the app is a substitute for care from a qualified clinician or emergency services. Always seek
        professional advice for health questions.
      </p>
      <h2>Not crisis or emergency support</h2>
      <p>
        CalmLane is not monitored in real time and cannot dispatch help. If you or someone else may be in immediate
        danger, could be hurt, or is experiencing a medical emergency, contact your local emergency number now and reach
        a trusted person who can be with you.
      </p>
      <h2>AI limitations</h2>
      <ul>
        <li>Responses may be inaccurate, incomplete, or inappropriate for your situation.</li>
        <li>The app does not know your full context and cannot verify facts about your life.</li>
        <li>Do not rely on CalmLane for legal, financial, or safety-critical decisions.</li>
      </ul>
      <h2>Use at your own discretion</h2>
      <p>
        By using CalmLane you agree that you are responsible for how you interpret and act on information in the app.
        If something does not feel right, pause and reach out to appropriate human support.
      </p>
    </LegalPage>
  );
}
