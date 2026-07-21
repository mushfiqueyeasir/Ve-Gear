export default function RefundPolicyPageScreen() {
  return (
    <section className="mx-auto max-w-3xl px-6 pb-24 pt-28 sm:px-8 md:px-10 md:pt-36">
      <p className="text-xs font-medium uppercase tracking-[0.28em] text-primary">
        Help
      </p>
      <h1 className="mb-8 mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
        Shipping &amp; Return Policy
      </h1>

      <div className="space-y-6 lg:space-y-8">
        <div>
          <h2 className="text-lg lg:text-xl font-medium mb-4">
            Shipping Information
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-base lg:text-lg font-medium mb-2">
                1. What are the shipping options?
              </h3>
              <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                We use &quot;Pathao Courier Service&quot; for all our
                deliveries.
              </p>
            </div>

            <div>
              <h3 className="text-base lg:text-lg font-medium mb-2">
                2. How do I track my order?
              </h3>
              <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                You will receive a text message from Pathao with a tracking
                link. Alternatively, you can DM us for more information about
                your order status.
              </p>
            </div>

            <div>
              <h3 className="text-base lg:text-lg font-medium mb-2">
                3. Shipping Fee
              </h3>
              <ul className="text-sm lg:text-base text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
                <li>
                  Inside Dhaka City: <span className="font-medium">80 BDT</span>
                </li>
                <li>
                  Outside Dhaka City:{" "}
                  <span className="font-medium">130 BDT</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-base lg:text-lg font-medium mb-2">
                Shipping Timeline
              </h3>
              <p className="text-sm lg:text-base text-muted-foreground leading-relaxed mb-2">
                We ship your order every day at 12 noon except on public
                holidays. After dispatch, approximately:
              </p>
              <ul className="text-sm lg:text-base text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
                <li>
                  <span className="font-medium">2 to 3 working days</span> for
                  metro cities
                </li>
                <li>
                  <span className="font-medium">3 to 5 working days</span> for
                  rest of Bangladesh
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg lg:text-xl font-medium mb-4">
            Returns Policy
          </h2>

          <div className="space-y-4">
            <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
              At VE Gear, we want you to be completely satisfied with your
              purchase. We offer returns under specific conditions to ensure a
              smooth experience.
            </p>

            <div>
              <h3 className="text-base lg:text-lg font-medium mb-2">
                Return Conditions
              </h3>
              <p className="text-sm lg:text-base text-muted-foreground leading-relaxed mb-3">
                In case of return, the products must be returned in their
                original condition with our packaging + tags/labels, as supplied
                to you. The delivery man will check the product in person at the
                time of return.
              </p>
              <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                There is an option to return if:
              </p>
              <ul className="text-sm lg:text-base text-muted-foreground leading-relaxed space-y-2 list-disc list-inside mt-2">
                <li>The size is wrong</li>
                <li>The product is damaged</li>
              </ul>
            </div>

            <div className="bg-black/5 p-4 rounded-lg">
              <p className="text-sm lg:text-base text-muted-foreground leading-relaxed font-medium">
                ⚠️ Important: Once delivered, the product cannot be exchanged or
                returned. Please inspect your order carefully upon delivery.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg lg:text-xl font-medium mb-3">Contact Us</h2>
          <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
            If you have any questions about our shipping or return policy,
            please don&apos;t hesitate to contact us. You can DM us on our
            social media platforms or reach out to our customer service team for
            assistance.
          </p>
        </div>
      </div>
    </section>
  );
}
