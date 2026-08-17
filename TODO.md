- use the api from https://[haveibeenpwned.com](https://haveibeenpwned.com/)/API/V3 on both frontend and backend
  - hash the password in SHA-1 then send only the first 5 characters
  - if the password has been breached
    - throw an error in backend
    - alert the user of the password being breached (based from haveibeenpwned.com/) and encourage him to change it in other websites, then ask them for a new password

- learn about the Stripe API to simulate a transaction for this website.
