import React from 'react';

export default function PrivacyPolicy() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-gray-600 mb-4">Last Updated: June {currentYear}</p>

      <div className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            Welcome to SalesPulse. We respect your privacy and are committed to protecting your personal data. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
            service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-medium my-3">2.1 Personal Information</h3>
          <p>We may collect personal information that you voluntarily provide to us when you:</p>
          <ul className="list-disc pl-6 my-3">
            <li>Create an account and use our platform</li>
            <li>Sign in with social authentication providers</li>
            <li>Complete forms or request services</li>
            <li>Contact our support team</li>
            <li>Participate in surveys or promotions</li>
          </ul>
          
          <p>This information may include:</p>
          <ul className="list-disc pl-6 my-3">
            <li>Name and contact details</li>
            <li>Professional information (employer, job title)</li>
            <li>Authentication data (password, security questions)</li>
            <li>Social media account details (when using social login)</li>
            <li>Transaction and billing information</li>
          </ul>
          
          <h3 className="text-xl font-medium my-3">2.2 Usage and Technical Data</h3>
          <p>When you access SalesPulse, we automatically collect:</p>
          <ul className="list-disc pl-6 my-3">
            <li>Device information (browser type, operating system)</li>
            <li>Usage patterns and preferences</li>
            <li>IP addresses and approximate location</li>
            <li>Session duration and activity</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 my-3">
            <li>Provide and maintain our services</li>
            <li>Process transactions and manage your account</li>
            <li>Personalize your experience</li>
            <li>Respond to your requests and support needs</li>
            <li>Improve our platform and develop new features</li>
            <li>Send service updates and administrative messages</li>
            <li>Protect against fraudulent or unauthorized activity</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
          <p>We may share your information with:</p>
          <ul className="list-disc pl-6 my-3">
            <li>Service providers that help operate our platform</li>
            <li>Integration partners (like payment processors)</li>
            <li>Your organization (if you use our services through an employer)</li>
            <li>Legal authorities when required by law</li>
          </ul>
          
          <p className="mt-4">
            We do not sell your personal information to third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information. 
            However, no method of transmission over the internet is 100% secure. While we strive 
            to protect your data, we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
          <p>Depending on your location, you may have rights to:</p>
          <ul className="list-disc pl-6 my-3">
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Delete your data</li>
            <li>Restrict or object to processing</li>
            <li>Data portability</li>
            <li>Withdraw consent</li>
          </ul>
          
          <p className="mt-4">
            To exercise these rights, please contact us at privacy@salespulse.com.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to provide our services 
            and fulfill the purposes outlined in this Privacy Policy. We also retain and use your 
            information as necessary to comply with legal obligations, resolve disputes, and enforce 
            our agreements.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
          <p>
            Our service is not directed to children under 16. We do not knowingly collect personal 
            information from children. If you believe we have collected information from a child, 
            please contact us immediately.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by 
            posting the new policy on this page and updating the "Last Updated" date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <address className="not-italic mt-3">
            SalesPulse<br />
            privacy@salespulse.com
          </address>
        </section>
      </div>
    </div>
  );
}
