const cors = require("cors");
const express = require("express");
const stripe = require("stripe")("sk_test_51HN2HjIHCbP4Y2mrsA8kMQDz6rk4QTx20APOkbWOKNBYzTxaYCbS6kJ8k0YDCpKXwXlSiXXh7j0evfa6yX7yzzZd00cGnduXrP");
const uuid = require("uuid/v4");

const app = express();

//middleware
app.use(express.json());
app.use(cors());

//routes
app.get("/", (req, res) => {
  res.send("It works!!");
});

app.post("/payment", async (req, res) => {
  console.log("Request:", req.body);

  let error;
  let status;
  try {
    const { product1, token } = req.body;
    console.log("PRODUCT1", product1);
    console.log("PRICE", product1.checkoutPrice);

    const idempotency_key = uuid();

    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id
    });


    const charge = await stripe.charges.create(
      {
        amount: product1.checkoutPrice * 100,
        currency: "inr",
        customer: customer.id,
        receipt_email: token.email,
        description: `Purchased the ${product1.name}`,
        shipping: {
          name: token.card.name,
          address: {
            line1: token.card.address_line1,
            line2: token.card.address_line2,
            city: token.card.address_city,
            country: token.card.address_country,
            postal_code: token.card.address_zip
          }
        }
      },
      {
        idempotency_key
      }
    );
    console.log("Charge:", { charge });
    status = "success";
  } catch (error) {
    console.error("Error:", error);
    status = "failure";
  }

  res.json({ error, status });
});

//listen
app.listen(8080);
