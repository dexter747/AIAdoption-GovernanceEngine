import type { Metadata } from 'next';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Shipping Policy',
  description:
    'Shipping Policy for Valenova. Learn about our digital delivery process for software licenses and subscriptions.',
};

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-28 pb-16 max-w-4xl">
        <h1 className="text-4xl font-medium text-foreground mb-4">Shipping Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 1, 2025</p>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-foreground mb-2">Digital Product Delivery</h2>
          <p className="text-muted-foreground">
            Valenova is a digital software product. All purchases — including subscriptions, license
            keys, and downloadable software — are delivered electronically. There are no physical
            goods shipped.
          </p>
        </div>

        <div className="max-w-none space-y-8 prose-invert">
          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">1. Delivery Method</h2>
            <p className="text-muted-foreground leading-relaxed">
              Upon successful payment, you will receive:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>A confirmation email at the address used during checkout</li>
              <li>Your license key or subscription activation details</li>
              <li>A download link to the Valenova desktop application (if applicable)</li>
              <li>Access to your account dashboard at valenova.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">2. Delivery Time</h2>
            <p className="text-muted-foreground leading-relaxed">
              Digital delivery is typically instant. In most cases, your license key and access
              credentials will be delivered within minutes of payment confirmation. If you do not
              receive your confirmation email within 30 minutes, please check your spam/junk folder
              before contacting support.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">3. No Physical Shipping</h2>
            <p className="text-muted-foreground leading-relaxed">
              As Valenova is a fully digital product, we do not ship any physical goods. There are
              no shipping fees, no tracking numbers, and no delivery lead times associated with our
              products. All software and services are accessed and downloaded digitally.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">4. Access After Purchase</h2>
            <p className="text-muted-foreground leading-relaxed">
              Once your purchase is confirmed:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>
                <strong className="text-foreground">Software Download:</strong> Available
                immediately from the Downloads page or your account dashboard
              </li>
              <li>
                <strong className="text-foreground">License Activation:</strong> Your license key
                will be emailed and also accessible in your account portal
              </li>
              <li>
                <strong className="text-foreground">Subscription Access:</strong> Your plan will be
                activated immediately upon payment
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">5. Delivery Issues</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you experience any issues with receiving your digital product, such as:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Not receiving a confirmation email</li>
              <li>Unable to access your license key</li>
              <li>Problems downloading the software</li>
              <li>Account activation issues</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Please contact our support team and we will resolve the issue promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">6. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For any delivery-related questions or issues, please reach out:
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p className="text-foreground">Valenova Support</p>
              <p className="text-muted-foreground">
                Email:{' '}
                <a href="mailto:info@astraeusnextgen.com" className="text-primary hover:underline">
                  info@astraeusnextgen.com
                </a>
              </p>
              <p className="text-muted-foreground">
                Phone:{' '}
                <a href="tel:+918530079105" className="text-primary hover:underline">
                  +91 85300 79105
                </a>
              </p>
              <p className="text-muted-foreground">
                Address: SNO 7/1 (P) 7/2 NR, Kokan Express, Kothrud, Pune, Maharashtra, India -
                411038
              </p>
              <p className="text-muted-foreground mt-2">Response time: Within 2 business days</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
