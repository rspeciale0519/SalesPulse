import React from 'react';

export default function DataDeletion() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Data Deletion Request</h1>
      <p className="text-gray-600 mb-8">Last Updated: June {currentYear}</p>

      <div className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How to Request Data Deletion</h2>
          <p className="mb-4">
            At SalesPulse, we respect your right to control your personal data. This page explains how you can request the deletion 
            of your personal information from our services.
          </p>
          
          <p className="mb-4">
            Under various privacy laws including GDPR, CCPA, and others, you have the right to request the deletion of your 
            personal data from our systems. We are committed to honoring these requests in accordance with applicable laws 
            and our own privacy policies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Deletion Request Methods</h2>
          <p className="mb-4">You can request deletion of your personal data through any of these methods:</p>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-medium mb-3">1. Email Request</h3>
            <p>
              Send an email to <a href="mailto:privacy@salespulse.com" className="text-blue-600 hover:underline">privacy@salespulse.com</a> with 
              the subject line "Data Deletion Request" and include:
            </p>
            <ul className="list-disc pl-6 my-3">
              <li>Your full name</li>
              <li>Email address associated with your account</li>
              <li>Organization name (if applicable)</li>
              <li>A statement requesting data deletion</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-medium mb-3">2. Account Settings</h3>
            <p>
              If you have an active account, you can initiate a data deletion request directly from your account:
            </p>
            <ol className="list-decimal pl-6 my-3">
              <li>Log in to your SalesPulse account</li>
              <li>Navigate to "Settings" &gt; "Account"</li>
              <li>Scroll to "Privacy & Data" section</li>
              <li>Click "Delete My Data" and confirm your request</li>
            </ol>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-medium mb-3">3. Written Request</h3>
            <p>
              Send a written request to:
            </p>
            <address className="not-italic mt-3">
              SalesPulse<br />
              Attn: Privacy Department<br />
              Data Deletion Request<br />
              privacy@salespulse.com
            </address>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Verification & Processing</h2>
          <p className="mb-4">
            To protect your privacy and security, we will verify your identity before processing your request. 
            This may include requesting additional information from you.
          </p>
          
          <p className="mb-4">
            Once verified, we will process your request within 30 days and send confirmation when complete.
            In some cases, we may take up to 45 days if the request is particularly complex.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Retention Requirements</h2>
          <p className="mb-4">
            Please note that we may retain certain information as required by law or for legitimate business purposes. 
            For example:
          </p>
          
          <ul className="list-disc pl-6 my-3">
            <li>Information needed for tax, legal, auditing, or account purposes</li>
            <li>Residual information in backup systems (deleted according to our backup rotation schedule)</li>
            <li>Aggregated, anonymized data that no longer identifies you</li>
            <li>Information necessary to document compliance with legal obligations</li>
          </ul>
          
          <p className="mt-4">
            We will clearly explain any data we must retain and the reason for retention.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Third-Party Data</h2>
          <p>
            When you use third-party services through SalesPulse (such as social login providers), 
            you may need to contact those third parties separately to request deletion of data they hold. 
            We will provide guidance on identifying these third parties if needed.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p>
            If you have questions about data deletion or need assistance with a deletion request, 
            please contact our privacy team at:
          </p>
          <p className="mt-3">
            <a href="mailto:privacy@salespulse.com" className="text-blue-600 hover:underline">privacy@salespulse.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
