# EduPlatform Demo Script — NFC Cards, Wallet & Terminal

**Duration:** ~7 minutes at normal pace
**Setup:** Log in as headteacher/admin, school must have students enrolled

---

## Scene 1: The Wallet Dashboard (0:00 – 1:30)

**Screen:** `/wallet`

> *"This is the wallet dashboard. Every student has a wallet, and a card that links to it.*

*Walk through the table:*
- Point to a student row: *"Here we see each student, their balance, and card status."*
- Hover over a card UID: *"This is the NFC card UID — a unique code that identifies this student's card."*

*Show the search bar:* *"You can search by student name to find anyone quickly."*

*Click the **Generate Card** wand icon on a student without a card:*
> *"If a student doesn't have a card yet, click this wand button. The server generates a unique EDU-XXXXXXXX code instantly."*

*Point to the Freeze/Unlock snowflake button:*
> *"You can freeze a card if it's lost or stolen. The student won't be able to tap until you unlock it."*

---

## Scene 2: Loading the Wallet (1:30 – 3:00)

**Screen:** Still `/wallet`, focus on the **Quick Top-Up** card

> *"To add money to a student's wallet, use the Quick Top-Up section."*

- Select a student from the dropdown
- Enter an amount like GHS 50
- Click **Add Funds**

> *"The balance updates immediately. You can top up by cash, card, or mobile money."*

*Show the table balance update:*
> *"The student now has GHS 50 available to spend at the canteen, transport, or printing services."*

---

## Scene 3: The Tap Terminal — Attendance (3:00 – 4:15)

**Screen:** `/terminal`

> *"Now let's see how students use their cards. This is the Tap Terminal — it turns any tablet into an NFC payment and attendance station."*

- Click the **Attendance** button (green)
- Enter a card UID (e.g., the one you just generated)
- Click **Tap for Attendance**

> *"The student is marked present for today. The parent receives an SMS alert: 'Your child was marked present at school today.'"*

*Show success checkmark:*
> *"No cash involved. Just tap and go."*

---

## Scene 4: The Tap Terminal — Payments (4:15 – 5:30)

**Screen:** Still `/terminal`

> *"Now for payments. Let's use the canteen."*

- Click **Canteen**
- Enter the same card UID
- Enter amount: GHS 5
- Click **Tap & Pay**

> *"GHS 5 is deducted from the wallet instantly. If the balance drops below GHS 5, the parent gets a low-balance SMS alert."*

*Show the result with new balance:*
> *"The same flow works for Transport, Printing, and School Fees — just pick the service and tap."*

---

## Scene 5: Checking Balance (5:30 – 6:15)

**Screen:** `/wallet` (or scan-only mode at `/terminal`)

> *"To check a student's balance, just come to the wallet dashboard. The table shows every wallet and its current balance."*

*Point to a specific row:* *"Here you can see GHS 45 remaining."*

*Now show the terminal scan:*
- At `/terminal`, select any service
- Enter the card UID
- Leave amount empty
- Click **Tap & Pay** (or Scan)

> *"If you tap without an amount, it just shows the student name and balance — a quick way to check without making any payment."*

---

## Scene 6: Printable Cards & ZPL (6:15 – 7:00)

**Screen:** `/wallet/cards`

> *"For physical card printing, go to the Cards page."*

*Point to the card grid:*
> *"Every student with a card is shown here with their name, photo placeholder, and card UID."*

- Click **Download ZPL (Zebra)**
- Click **Print Cards** for browser printing

> *"You can print on any standard printer from the browser, or download ZPL files for professional Zebra card printers."*

---

## Scene 7: Ordering Physical NFC Cards (bonus)

**Screen:** `/wallet/orders/new`

> *"If you need physical NFC cards printed and shipped, use the Order Cards feature."*

*Check students without cards:*
> *"Select the students who need cards, add notes, and submit. The platform processes and ships them."*

**Screen:** `/wallet/orders`
> *"Track each order from processing to delivered."*

---

## Outro (7:00)

> *"That's the NFC card and wallet system. Students tap for everything, parents stay informed, and the school saves time and cash handling. Visit eduplatform.com to get started."*
