# Plaid integration

- [Official documentation](https://plaid.com/docs/)
- [Glossary](https://plaid.com/docs/quickstart/glossary/)

## Flow

The Plaid flow works as below:

[Link](https://plaid.com/docs/link/) is used to provide an interface to for a user to connect their accounts from a financial institution.
A [successful connection](https://plaid.com/docs/link/) to a financial institution returns an [Item](https://plaid.com/docs/quickstart/glossary/#item).
The Item will contain meta data for the institution (i.e. name) and a `public token` along with a collection of accounts that were enabled (i.e. checking, credit card, etc).

With a `public token`, an `access token` can be generated to start retrieving transactions. Since it's token is associated with an Item (i.e. fin

## Sandbox environment

Plaid provides a [Sandbox](https://plaid.com/docs/sandbox/) environment for development and testing. This can be used to generate [custom users](https://plaid.com/docs/sandbox/user-custom/) for testing.
