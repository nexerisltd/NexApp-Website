export const metadata = { title: "Terms of Service — NexApp" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-text-muted">
        {children}
      </div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="font-display text-4xl font-extrabold">Terms of Service</h1>
      <p className="mt-3 text-sm text-text-muted">
        Last updated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
      </p>
      <p className="mt-6 text-sm leading-relaxed text-text-muted">
        By creating an account or using NexApp, you agree to these Terms. If you
        don&apos;t agree, please don&apos;t use the platform.
      </p>

      <Section title="1. Your account">
        <p>
          You sign in with Google, and you&apos;re responsible for activity that happens
          under your account. You must be legally able to enter into these Terms in your
          jurisdiction to use NexApp.
        </p>
      </Section>

      <Section title="2. Submitting an app">
        <p>
          Anyone with an account can submit an app for review. To submit, you must
          provide a link to the app&apos;s public or private GitHub repository. This is
          mandatory for every outside-developer submission — admin-created listings are
          exempt since they&apos;re published directly by our team.
        </p>
        <p>
          <strong className="text-text">Why we require this.</strong> Our verified,
          official review team uses the repository solely to test your app and confirm
          it&apos;s safe before it&apos;s published — protecting the people who use our
          store. We do not use it for any other purpose, and it is never redistributed.
        </p>
        <p>
          <strong className="text-text">You stay in control.</strong> Providing the repo
          link doesn&apos;t change who owns the code or the app — that&apos;s entirely
          yours. You separately choose whether the link is shown publicly on your
          app&apos;s page using the &quot;Public your source?&quot; setting; leaving it
          unchecked keeps the repository visible to our review team only, at any time,
          for any reason, with no penalty to your listing.
        </p>
        <p>
          We may reject, unpublish, or remove any submission at our discretion —
          including apps that fail security review, apps that infringe someone
          else&apos;s rights, or apps that violate Section 4 below.
        </p>
      </Section>

      <Section title="3. Ownership of your content">
        <p>
          You retain all ownership rights to the apps, descriptions, images, and source
          code you submit. By submitting, you grant NexApp a non-exclusive license to
          host, display, and distribute that content on the platform for as long as your
          listing remains published.
        </p>
      </Section>

      <Section title="4. Acceptable use">
        <p>You agree not to submit or post anything that:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Contains malware, spyware, or code intended to harm users or their devices.</li>
          <li>Infringes another party&apos;s intellectual property or other legal rights.</li>
          <li>Is illegal, fraudulent, or misleading about what the app actually does.</li>
          <li>Harasses, threatens, or is otherwise abusive toward other users.</li>
        </ul>
      </Section>

      <Section title="5. Reviews & community content">
        <p>
          Ratings, reviews, and reports are meant to reflect genuine experience with an
          app. We may remove content that violates Section 4, and repeated or severe
          violations may result in account suspension.
        </p>
      </Section>

      <Section title="6. Disclaimer & limitation of liability">
        <p>
          NexApp is provided &quot;as is.&quot; While we review submissions before
          publishing them, we can&apos;t guarantee every listed app is free of defects,
          and we&apos;re not liable for damages arising from your use of apps discovered
          through the platform, to the fullest extent permitted by law.
        </p>
      </Section>

      <Section title="7. Termination">
        <p>
          You may delete your account at any time. We may suspend or terminate accounts
          that violate these Terms.
        </p>
      </Section>

      <Section title="8. Changes to these Terms">
        <p>
          We may update these Terms occasionally. Continued use of NexApp after a change
          means you accept the updated Terms.
        </p>
      </Section>

      <Section title="9. Contact us">
        <p>
          Questions about these Terms? Reach us at{" "}
          <a href="mailto:nexappog@gmail.com" className="text-accent underline">
            nexappog@gmail.com
          </a>{" "}
          (official NexApp support).
        </p>
        <p>
          NexApp is a product of{" "}
          <a href="mailto:nexeris.ltd@gmail.com" className="text-accent underline">
            Nexeris Ltd.
          </a>{" "}
          (nexeris.ltd@gmail.com), built and maintained by{" "}
          <a href="mailto:mr.arx.me@gmail.com" className="text-accent underline">
            Arabi Islam / MR. ARX
          </a>{" "}
          (mr.arx.me@gmail.com).
        </p>
      </Section>
    </div>
  );
}
