export const metadata = { title: "Privacy Policy — NexApp" };

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

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="font-display text-4xl font-extrabold">Privacy Policy</h1>
      <p className="mt-3 text-sm text-text-muted">
        Last updated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
      </p>
      <p className="mt-6 text-sm leading-relaxed text-text-muted">
        This Privacy Policy explains what information NexApp (&quot;we&quot;,
        &quot;us&quot;) collects when you use our app store platform, how we use it,
        and the choices you have.
      </p>

      <Section title="1. Information we collect">
        <p>
          <strong className="text-text">Account information.</strong> When you sign in
          with Google, we receive your name, email address, and profile picture from
          Google to create and identify your NexApp account. We do not receive your
          Google password.
        </p>
        <p>
          <strong className="text-text">Content you provide.</strong> App listings you
          submit (name, description, screenshots, icon, cover image, download links,
          and — for developer submissions — a GitHub repository link), reviews and
          star ratings you post, and reports you file.
        </p>
        <p>
          <strong className="text-text">Usage information.</strong> Basic activity
          needed to run the store: download counts, your favorites list, and
          notifications addressed to you.
        </p>
      </Section>

      <Section title="2. How we use your information">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>To create and maintain your account and authenticate you via Google sign-in.</li>
          <li>To display your name and avatar next to reviews and submissions you make.</li>
          <li>To let you track your favorites, downloads, and notifications.</li>
          <li>
            To review app submissions — including testing the linked source code — before
            they&apos;re published, for the security reasons described in Section 4.
          </li>
          <li>To communicate with you about your account or submissions when necessary.</li>
        </ul>
      </Section>

      <Section title="3. Cookies & local storage">
        <p>
          We use essential cookies/local storage to keep you signed in and remember basic
          preferences (like light/dark theme). We do not use third-party advertising
          trackers.
        </p>
      </Section>

      <Section title="4. Submitted source code — how we handle it">
        <p>
          When a developer submits an app, we require a link to the app&apos;s GitHub
          repository. This is used solely by our verified, official review team to test
          the app and confirm it doesn&apos;t put people using our store at risk — it is
          not redistributed, published elsewhere, or used for any purpose beyond that
          security review.
        </p>
        <p>
          Developers control whether the repository link is also shown publicly on their
          app&apos;s page (via the &quot;Public your source?&quot; setting). If left
          unchecked, the link stays visible to our review team only and is never shown to
          other users.
        </p>
      </Section>

      <Section title="5. Sharing your information">
        <p>
          We don&apos;t sell your personal information. We share it only with the
          service providers that run NexApp&apos;s infrastructure (authentication,
          database, and file storage, and hosting), strictly to operate the platform, and
          only to the extent needed for them to provide that service — or when required
          by law.
        </p>
      </Section>

      <Section title="6. Data retention & deletion">
        <p>
          We retain your account data for as long as your account is active. You can
          permanently delete your account and associated personal data at any time from
          your profile settings. Content you&apos;ve contributed that&apos;s already
          public (such as a published app listing) may be retained or reassigned to keep
          the store consistent for other users, with your personal identifiers removed.
        </p>
      </Section>

      <Section title="7. Your rights">
        <p>
          Depending on where you live, you may have the right to access, correct, export,
          or delete your personal data. You can exercise most of these directly from your
          account settings, or contact us using the details below.
        </p>
      </Section>

      <Section title="8. Children's privacy">
        <p>
          NexApp is not directed at children under 13, and we do not knowingly collect
          personal information from children under 13. If you believe a child has
          provided us with personal information, please contact us and we&apos;ll remove
          it.
        </p>
      </Section>

      <Section title="9. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. Material changes will be
          reflected by updating the &quot;Last updated&quot; date above.
        </p>
      </Section>

      <Section title="10. Contact us">
        <p>
          Questions about this policy or your data? Reach us at{" "}
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
