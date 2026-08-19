- use the api from https://[haveibeenpwned.com](https://haveibeenpwned.com/)/API/V3 on both frontend and backend
  - hash the password in SHA-1 then send only the first 5 characters
  - if the password has been breached
    - throw an error in backend
    - alert the user of the password being breached (based from haveibeenpwned.com/) and encourage him to change it in other websites, then ask them for a new password

- learn about the Stripe API to simulate a transaction for this website.

in the frontend side:
when using Oauth, autocomplete and block the email entry.

for authentication, make sure that creating an account inserts both user_auth and user entries at the same time, and also creates a new session automatically.

# STEPS FOR ORDERS

insert a new order
insert each order item for that order by fetching all necessary data from products and cart_items tables
use the method calculateOrderTotalPrice to update the order's total_price row with that total
