// app/privacy-policy/page.js
export default function PrivacyPolicy() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-[#335566] mb-6">
          Privacy Policy
        </h1>
        <p className="text-gray-700 mb-4">
          At <strong>Buckers Auction</strong>, we value your privacy and are committed to protecting
          your personal information. This Privacy Policy explains how we collect,
          use, and safeguard your data when you use our platform.
        </p>

        <h2 className="text-xl font-semibold text-[#335566] mt-6 mb-3">
          1. Information We Collect
        </h2>
        <p className="text-gray-700 mb-4">
          We may collect the following types of information:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>Personal details such as your name, email, phone number, and address</li>
          <li>Payment information for transactions</li>
          <li>Account login details</li>
          <li>Usage data such as IP address, browser type, and device information</li>
        </ul>

        <h2 className="text-xl font-semibold text-[#335566] mt-6 mb-3">
          2. How We Use Your Information
        </h2>
        <p className="text-gray-700 mb-4">
          We use your information to:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>Facilitate transactions between buyers and sellers</li>
          <li>Improve our platform’s functionality and user experience</li>
          <li>Provide customer support and respond to inquiries</li>
          <li>Send important updates and marketing communications (with your consent)</li>
        </ul>

        <h2 className="text-xl font-semibold text-[#335566] mt-6 mb-3">
          3. Data Protection
        </h2>
        <p className="text-gray-700 mb-4">
          We implement appropriate security measures to protect your personal
          data from unauthorized access, disclosure, alteration, or destruction.
          However, no method of transmission over the internet is 100% secure.
        </p>

        <h2 className="text-xl font-semibold text-[#335566] mt-6 mb-3">
          4. Sharing Your Information
        </h2>
        <p className="text-gray-700 mb-4">
          We do not sell or rent your personal information. We may share your
          data with trusted service providers, payment processors, or when
          required by law.
        </p>

        <h2 className="text-xl font-semibold text-[#335566] mt-6 mb-3">
          5. Your Rights
        </h2>
        <p className="text-gray-700 mb-4">
          You have the right to access, update, or delete your personal
          information. To exercise these rights, please {" "}
          <a
            href="/contact"
            className="text-[#335566] underline"
          >
            Contact us
          </a>.
        </p>

        <h2 className="text-xl font-semibold text-[#335566] mt-6 mb-3">
          6. Changes to This Policy
        </h2>
        <p className="text-gray-700 mb-4">
          We may update this Privacy Policy from time to time. Any changes will
          be posted on this page with an updated effective date.
        </p>

        <h2 className="text-xl font-semibold text-[#335566] mt-6 mb-3">
          7. Contact Us
        </h2>
        <p className="text-gray-700">
          If you have any questions about this Privacy Policy, please {" "}
          <a
            href="/contact"
            className="text-[#335566] underline"
          >
            Contact us
          </a>.
        </p>
      </div>
    </div>
  );
}
