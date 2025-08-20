// app/terms-of-service/page.js
export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Page Header */}
      <div className="bg-[#5B0F00] text-white py-12 px-6 text-center">
        <h1 className="text-4xl font-bold">
          The Buckers Auction – Terms &amp; Conditions
        </h1>
        <p className="mt-2 text-lg">
          Please read carefully before using our platform
        </p>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto py-12 px-6 space-y-8 leading-relaxed">
        {/* 1. Marketing Venue */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            1. The Buckers Auction Is a Marketing Venue
          </h2>
          <p>
            The Buckers Auction is an online marketing platform that allows
            breeders to list and market rodeo stock in a timed, bidding-style
            format. While our services use an “auction” style presentation, The
            Buckers Auction is not a traditional auction service or auctioneer.
            We are not a party to any transaction and do not act as a broker,
            agent, or guarantor for either seller (consignor) or buyer.
          </p>
          <p className="mt-4 font-medium">
            All representations, descriptions, and warranties regarding a lot
            are solely the responsibility of the consignor. This includes but is
            not limited to:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Health and soundness</li>
            <li>Pedigree accuracy</li>
            <li>Breeding ability or pregnancy status</li>
            <li>Quality or storage condition of semen/embryos</li>
            <li>Bucking ability</li>
          </ul>
          <p className="mt-4">
            The Buckers Auction does not guarantee payment from buyers or the
            completion of any transaction, or condition of any lot. Legal
            ownership of a lot does not transfer through The Buckers Auction—it
            is transferred directly between buyer and seller after the close of
            bidding.
          </p>
          <p className="mt-4">
            We reserve the right to refuse service, suspend accounts, or remove
            listings at our discretion.
          </p>
        </section>

        {/* 2. Seller Rules */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Seller (Consignor) Rules</h2>
          <p>
            By listing (or donating) with The Buckers Auction, the consignor
            agrees to:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-2">
            <li>
              <strong>Accurate Information</strong> – Provide complete and
              accurate details for each lot, including ABBI # (if applicable),
              sire/dam, date of birth, pregnancy status, location, photos/videos,
              and reserve price.
            </li>
            <li>
              <strong>Pedigree &amp; Health Guarantees</strong> – If DNA results
              or health conditions do not match the seller’s representation, the
              buyer may cancel the transaction and receive a full refund.
            </li>
            <li>
              <strong>Condition of Lot</strong> – All animals are considered
              healthy and sound unless clearly stated otherwise in the listing.
            </li>
            <li>
              <strong>Registration Papers</strong> – If the lot is registered,
              the consignor must transfer papers to the buyer within 45 days of
              receiving payment and transfer fees.
            </li>
            <li>
              <strong>Deposits &amp; Fees</strong> – A non-refundable deposit of
              $100 per lot is due when booking a listing (unless otherwise
              agreed). If the lot sells and the buyer pays, the consignor agrees
              to pay Buckers Auction 5% of the gross sale price within 10
              business days of receiving payment. If the buyer does not pay, no
              commission is owed.
            </li>
            <li>
              <strong>Communication</strong> – Be reachable by phone during the
              auction to answer questions or resolve issues. Notify Buckers
              Auction immediately if an error appears in your listing or a
              bidding mistake occurs.
            </li>
            <li>
              <strong>Finality of Sale</strong> – Once bidding meets or exceeds
              your reserve, you must sell to the highest bidder.
            </li>
            <li>
              <strong>Responsibility for Completion</strong> – Seller is solely
              responsible for collecting payment, arranging delivery, and
              completing legal ownership transfer.
            </li>
          </ul>
          <p className="mt-4">
            If health papers are required for transport or requested by the
            buyer, the seller must make them available, but the buyer is
            responsible for requesting them and paying any associated costs,
            unless the seller agrees otherwise in writing. The Buckers Auction
            is not responsible for arranging, verifying, or paying for health
            papers.
          </p>
        </section>

        {/* 3. Buyer Rules */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Buyer Rules</h2>
          <p>By bidding on Buckers Auction, the buyer agrees to:</p>
          <ul className="list-disc ml-6 mt-2 space-y-2">
            <li>
              <strong>Bidding Commitment</strong> – Place bids only if you have
              the intent and means to pay and take delivery according to the
              seller’s terms. All bids are final once placed, unless corrected
              immediately during the auction.
            </li>
            <li>
              <strong>Payment &amp; Delivery</strong> – The winning bidder is
              required to pay for the lot in full and take possession within 7
              days of the auction close, unless other arrangements are made
              directly in writing with the seller. The Buckers Auction is not
              responsible for enforcing payment or pickup. The winning bidder
              must contact the consignor promptly to arrange payment and
              delivery.
            </li>
            <li>
              <strong>Reserve Prices</strong> – If your bid meets the reserve and
              you are the highest bidder when the auction closes, you are
              required to purchase the lot.
            </li>
            <li>
              <strong>Auction Closing Process</strong> – Each lot has a scheduled
              end time. If a bid is placed within the last 5 minutes, the auction
              will extend until no bids are received for 5 consecutive minutes.
            </li>
            <li>
              <strong>Mistaken Bids</strong> – If you make a bidding error,
              notify The Buckers Auction immediately during the live auction to
              correct it. Failure to do so may result in loss of bidding
              privileges.
            </li>
            <li>
              <strong>Default</strong> – Failure to complete a purchase may
              result in suspension or permanent removal from Buckers Auction. The
              seller may also pursue damages.
            </li>
          </ul>
          <p className="mt-4">
            If health papers are required by law or requested by the buyer, it is
            the buyer's responsibility to request them before pickup or delivery.
            The buyer is responsible for all costs associated with obtaining
            health papers, unless the seller agrees otherwise in writing. The
            Buckers Auction is not responsible for providing or verifying health
            papers.
          </p>

          {/* Blacklist Notice */}
          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <h3 className="text-xl font-semibold mb-2">3.1 Blacklist Notice</h3>
            <p>
              The individuals listed here have been restricted from bidding on
              auctions hosted by Buckers Auction. While we take every reasonable
              step to block participation from blacklisted bidders, we cannot
              guarantee they will be fully prevented from placing bids. In the
              event a bid is not automatically blocked, it will still be accepted
              as valid and binding. This list is provided to increase
              transparency and represents a best-effort measure.
            </p>
          </div>
        </section>

        {/* 4. Benefit or Charity Auctions */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            4. Benefit or Charity Auctions
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              The Buckers Auction is not the fundraiser and is not affiliated
              with the benefit, nonprofit, or cause.
            </li>
            <li>
              No guarantee of funds used. We do not verify how proceeds are used
              or if they are used for the stated purpose.
            </li>
            <li>All standard seller and buyer rules apply.</li>
            <li>
              Unless otherwise agreed, the buyer will pay the consignor
              directly, and the consignor is responsible for delivering proceeds
              to the recipient.
            </li>
            <li>
              The Buckers Auction is not liable for disputes regarding benefit
              payments or charitable commitments.
            </li>
          </ul>
        </section>

        {/* 5. General Provisions */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">5. General Provisions</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              No warranties regarding animals or goods sold, their fitness for
              purpose, or accuracy of claims.
            </li>
            <li>All disputes are to be resolved directly between buyer and seller.</li>
            <li>
              We reserve the right to refuse service, remove listings, or revoke
              user access at any time.
            </li>
            <li>
              By listing or bidding, you agree to all Terms &amp; Conditions
              herein.
            </li>
            <li>
              These Terms &amp; Conditions constitute the entire agreement and
              supersede any prior understandings.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
