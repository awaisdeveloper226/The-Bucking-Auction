export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Page Header */}
      <div className="bg-[#5B0F00] text-white py-12 px-6 text-center">
        <h1 className="text-4xl font-bold">The Buckers Auction – Terms & Conditions</h1>
        <p className="mt-2 text-lg">Please read carefully before using our platform</p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-12 px-6 space-y-6 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. The Buckers Auction Is a Marketing Venue</h2>
          <p>
            The Buckers Auction is an online marketing platform that allows breeders to list and market rodeo stock
            in a timed, bidding-style format. While our services use an “auction” style presentation, The Buckers
            Auction is not a traditional auction service or auctioneer. We are not a party to any transaction and do
            not act as a broker, agent, or guarantor for either seller (consignor) or buyer.
          </p>
        </section>

        <section>
          <p className="font-medium">All representations, descriptions, and warranties regarding a lot are solely the responsibility of the consignor. This includes but is not limited to:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Health and soundness</li>
            <li>Pedigree accuracy</li>
            <li>Breeding ability or pregnancy status</li>
            <li>Quality or storage condition of semen/embryos</li>
            <li>Bucking ability</li>
          </ul>
        </section>

        <section>
          <p>
            The Buckers Auction does not guarantee payment from buyers or the completion of any transaction, or the
            condition of any lot. Legal ownership of a lot does not transfer through The Buckers Auction—it is
            transferred directly between buyer and seller after the close of bidding.
          </p>
        </section>

        <section>
          <p>
            We reserve the right to refuse service, suspend accounts, or remove listings at our discretion.
          </p>
        </section>
      </div>

      {/* Footer Note */}
      <div className="bg-gray-100 py-6 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} The Buckers Auction. All rights reserved.
      </div>
    </div>
  );
}
