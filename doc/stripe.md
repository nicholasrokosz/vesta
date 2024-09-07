# Stripe Connect integration

Vesta leverages Stripe Connect to support direct booking payments for our customers.

## Connecting to the customer's Stripe account

https://stripe.com/docs/connect/enable-payment-acceptance-guide
https://github.com/stripe-samples/connect-onboarding-for-standard/tree/main

## Supporting payments on the customer's behalf

Implemented via a **direct charge**
https://stripe.com/docs/connect/direct-charges

## Testing

https://stripe.com/docs/payments/accept-a-payment?platform=web&ui=embedded-checkout#testing
https://dashboard.stripe.com/test/payments

### View logs

You can view logs by pull the request id from the Stripe payloads.
https://dashboard.stripe.com/test/logs/req_3oNCYuUciYTHvW

## Future work

As we dive deeper in to guest pays, we should create a Stripe Customer on the Connect account and attach it to the Guest record. From there, we could potentially save their payment info as well as trigger guest invoices for additional services.
